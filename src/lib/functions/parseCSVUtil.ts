import Papa from 'papaparse';
import { convertTo24Hour } from '$lib/functions/24HrConversion.ts';

// Color pairs for course events
const colors = [
  { mainColor: '#B7DAB2', complementColor: '#35712C' },
  { mainColor: '#99CC67', complementColor: '#349946' },
  { mainColor: '#86C8BC', complementColor: '#36504B' },
  { mainColor: '#99D5E9', complementColor: '#00688C' },
  { mainColor: '#FBD865', complementColor: '#B09747' },
  { mainColor: '#8B87A1', complementColor: '#3E3B54' },
  { mainColor: '#EEBE99', complementColor: '#D45D00' },
  { mainColor: '#EA866E', complementColor: '#9E3922' },
  { mainColor: '#DCDCDD', complementColor: '#757677' }
];

/**
 * Parses a CSV file and transforms it into course events
 * @param file The CSV file to parse
 * @returns An array of processed course objects ready for the calendar
 */
export async function parseCSVFile(file: File) {
  // No file check
  if (!file) {
    console.log('No file chosen');
    return [];
  }

  const reader = new FileReader();
  const uploadedData = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

  // CourseLeaf has two lines of metadata at the beginning of the file, so we need to remove them
  const lines = uploadedData.split('\n'); // Split the string into lines
  // Remove the first two lines
  const removeHeaders = lines.slice(2);
  // Join the remaining lines back into a string
  const uploadedDataHeadersRemoved = removeHeaders.join('\n');

  // Parse the CSV data
  const csvData = Papa.parse(uploadedDataHeadersRemoved, { header: true }).data;
  //we need to filter out any rows that don't have a CRN, as they do not have a meeting pattern
  const csvFinal = csvData.filter((row: any) => row.hasOwnProperty('CRN'));

  //Since the data has meeting patterns that are abbreviated, we need to map the abbreviations to the preset days we specified in the vkurko calendar
  const dayMapping = {
    m: '2024-07-01T',
    t: '2024-07-02T',
    w: '2024-07-03T',
    r: '2024-07-04T',
    f: '2024-07-05T'
  };

  //splits up the meeting pattern into days and times
  csvData.forEach((row: any) => {
    if (row.CRN && row['Meeting Pattern'] !== 'Does Not Meet') {
      const [meetingDays, meetingTime] = row['Meeting Pattern'].split(' ', 2);
      row.meetingDays = meetingDays
        .split('')
        .map((day: string) => dayMapping[day.toLowerCase() as keyof typeof dayMapping]);
      row.meetingTime = meetingTime.split('-').map(convertTo24Hour);
    }
  });

  // Process courses into event format
  const processedCourses: any[] = [];
  // Store colors by CRN to maintain consistency across multiple sections of same course
  const courseColorMap = new Map();

  csvFinal.forEach((course: any) => {
    // Assign a random color if this course doesn't have one yet
    if (!courseColorMap.has(course.CRN)) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      courseColorMap.set(course.CRN, colors[randomIndex]);
    }
    
    const courseColor = courseColorMap.get(course.CRN);
    
    // if the course meets on more than one day, we need to create a separate event for each day
    if (course.meetingDays && course.meetingDays.length > 1) {
      course.meetingDays.forEach((day: any) => {
        const newCourse = {
          id: course.CRN,
          title: course.Course,
          start: day + course.meetingTime[0],
          end: day + course.meetingTime[1],
          extendedProps: {
            formattedTime: course.meetingTime[0] + ' - ' + course.meetingTime[1],
            buildingAndRoom: course['Building and Room'],
            CRN: course.CRN,
            Course: course.Course,
            Instructor: course.Instructor,
            meetingDays: course.meetingDays,
            meetingTime: course.meetingTime,
            color: courseColor.mainColor,
            pairingColor: courseColor.complementColor
          },
          color: courseColor.mainColor
        };
        processedCourses.push(newCourse);
      });
    } else if (course.meetingDays) {
      const newCourse = {
        id: course.CRN,
        title: course.Course,
        start: '2024-07-01T' + course.meetingTime[0],
        end: '2024-07-01T' + course.meetingTime[1],
        extendedProps: {
          formattedTime: course.meetingTime[0] + ' - ' + course.meetingTime[1],
          buildingAndRoom: course['Building and Room'],
          CRN: course.CRN,
          Course: course.Course,
          Instructor: course.Instructor,
          meetingDays: course.meetingDays,
          meetingTime: course.meetingTime,
          color: courseColor.mainColor,
          pairingColor: courseColor.complementColor
        },
        color: courseColor.mainColor
      };
      processedCourses.push(newCourse);
    }
  });

  return processedCourses;
}