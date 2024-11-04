<script lang="ts">
	import {dataStore, yearAndSeason, courses, rooms} from './mongodbData.js'
	import { file } from './modals/messageModal.js'
	// gets the data objects from the database and reassigns them to listData
	export let data: any
	import Calendar from './calendar/+page.svelte'
	import AddClass from './addClass/+page.svelte'
	import ImportCSV from './importCSV/+page.svelte'
	import Edit from './edit/+page.svelte'
	import ProgressModal from './modals/progressModal.svelte'
	import {filteredModal, filteredModalS, closeFilterSelectors, filteredModalPrint} from './modals/messageModal.js'
	import Message from './modals/modal.svelte'
	import DeleteProgressModal from './modals/deleteprogressModal.svelte'
	import html2canvas from 'html2canvas'
	import NameSchedule from './nameSchedule/NameSchedule.svelte'

	console.log('this will only appear on the stale branch')

	let addClassModal = false
	let importCSVModal = false
	let editClassModal = false

	let filterSelected = "w-0"
	// let filterSelected = "w-0"
	let importSelected = "w-0"
	// let importSelectedS = "text-white"
	let addSelected = "w-0"
	// let addSelectedS = "text-white"
	let editSelected = "w-0"
	// let editSelectedS = "text-white"
	let hiddenHeader = ""
	let hoverPrint = false
	let hoverExport = false

	// $: console.log(data?.body?.theYearAndSeason)

	// if there is any changes to the data in our database it will update the file, yearAndSeason, courses, and rooms stores
    $: if (data) {
        dataStore.set(data?.body?.events);
		if (data?.body?.name === null) {
			file.set({fileName: 'No File'})
		} else {
			file.set(data?.body?.name)
		}
		if (data?.body?.theYearAndSeason === null) {
			yearAndSeason.set({year: 'default', season: 'default'})
		} else {
			yearAndSeason.set(data?.body?.theYearAndSeason)
		}
		courses.set(data?.body?.courses)
		rooms.set(data?.body?.roomsList)
    }

	// This opens and closes the "add schedules" modal
	function toggleModal() {
		addClassModal = !addClassModal
		// checks if add button is selected and highlights the text to secondary color
		if (addClassModal) {
			addSelected = "w-full"
			filteredModal.set(false)
			filteredModalS.set(false)
			closeFilterSelectors.set(false)
			filterSelected = "w-0"
			// addSelectedS = "text-secondary md:text-primary"
		} else if (!addClassModal) {
			addSelected = "w-0"
			// addSelectedS = "text-primary"
		}
	}

	// This opens and closes the "import csv" modal
	function toggleImportModal() {
		importCSVModal = !importCSVModal
		// checks if import button is selected and highlights the text to secondary color
		if (importCSVModal) {
			importSelected = "w-full"
			filteredModal.set(false)
			filteredModalS.set(false)
			closeFilterSelectors.set(false)
			filterSelected = "w-0"
			// importSelectedS = "text-secondary md:text-primary"
		} else if (!importCSVModal) {
			importSelected = "w-0"
			// importSelectedS = "text-primary"
		}
	}

	// This opens and closes the "edit schedules" modal
	function toggleEditModal() {
		editClassModal = !editClassModal
		if (editClassModal) {
			editSelected = "w-full"
			filteredModal.set(false)
			filteredModalS.set(false)
			closeFilterSelectors.set(false)
			filterSelected = "w-0"
			// editSelectedS = "text-secondary md:text-primary"
		} else if (!editClassModal) {
			editSelected = "w-0"
			// editSelectedS = "text-primary"
		}
	}

	// This opens and closes the "filter" modal
	function openFilterModal() {
		if (!$filteredModal) {
			filteredModal.set(true)
			filteredModalS.set(true)
			closeFilterSelectors.set(true)
			filterSelected = "w-full"
		} else if ($filteredModal) {
			filteredModal.set(false)
			filteredModalS.set(false)
			closeFilterSelectors.set(false)
			filterSelected = "w-0"
		}
	}
	//   end CSV file handling





	// this will take the user confirmed courses and add them to a courses array, to add them to the calendar
	function confirmImportedCourses(event: any){
	
		event.preventDefault();

		//due to the way the calendar works, we need to map the days to specific dates
		const dayToDateMap = {
  'Monday': '2024-07-01 T',
  'Tuesday': '2024-07-02 T',
  'Wednesday': '2024-07-03 T',
  'Thursday': '2024-07-04 T',
  'Friday': '2024-07-05 T'
};

function mapMeetingDays(days) {
  let newMap = days.map(day => dayToDateMap[day]);
  console.log('new map:', newMap);
  return newMap;
}



    const form = event.target;
    csvData.forEach((row, index) => {


      if (row.CRN && row['Meeting Pattern'] !== 'Does Not Meet') {
		// since our calendar doesn't allow repeating events, we need to map the days to specific dates
		let calendarFriendlyDays = mapMeetingDays(row.meetingDays);
		calendarFriendlyDays.forEach((day: any) => {
        const course = {
        //   title: form[`name-${index}`].value + form[`crn-${index}`].value,
		title:	{html: form[`name-${index}`].value + "<br> CRN: " + form[`crn-${index}`].value + "<br> Instructor: " + form[`instructor-${index}`].value + "<br> Building and Room: " + form[`building-room-${index}`].value},
          crn: form[`crn-${index}`].value,
          instructor: form[`instructor-${index}`].value,
          buildingRoom: form[`building-room-${index}`].value,

			meetingDays: mapMeetingDays(row.meetingDays),
		  start: day + form[`start-time-${index}`].value,
		  end: day + form[`end-time-${index}`].value,
		  backgroundColor: `#${form[`crn-${index}`].value}e`
        };
        courses.push(course);
		events.update((value: any) => {
			return [...value, course];
		});
	})
		// console.log('here is the pushed courses,', courses);


      }



    });

    // console.log('here is the pushed courses,', courses);
	isUploadModalActive = !isUploadModalActive;
	}

  

	function handleMeetingChange(event: Event, row: any) {
		const input = event.target as HTMLInputElement;
        row.meetingTime = input.checked ? 'Does Not Meet' : '';
		// console.log('meeting time:', row.meetingTime);
	}


    // afterUpdate(() => {
    //     events.subscribe(value => {
    //         value.forEach((event) => {
	// 			console.log('event:', event);
    //         });
    //         console.log('total events store', value);
    // });
    // });
</script>

<main class="h-full w-full">
	<!-- main functionality buttons -->
	 <div class="w-full flex justify-between bg-gray-100 h-[44px]">

		<div class="flex flex-wrap flex-col mx-3 items-center justify-center">
<p class="uppercase text-[18px]">Title:</p>
<input class="input !bg-white placeholder-[#757677] !rounded-lg"  type="text" name="" id="" placeholder="Default Schedule Title">
</div>

<button
type="button"
class="btn bg-gradient-to-br variant-gradient-primary-secondary rounded-md text-sm mx-2 font-primary uppercase"
on:click={handleUploadModal}>Add Timeblock</button
>
</div>

<body class="flex flex-wrap w-full h-full flex-row">
	 <!-- sidebar -->
	<div id="sidebar" class="w-auto h-auto border border-[#DCDCDD] border-y-2">

	<div id="import" class="border m-4 p-2 w-[269px] rounded-lg">
<p class="text-[15px] text-uvu-green">Current file:</p>
<p>{fileName}</p>
<button
			type="button"
			class="btn bg-[#DDDDDD] uppercase rounded-2xl text-sm font-primary w-full"
			on:click={handleUploadModal}>Import New .CSV</button
		>
	</div>	

	<div class="flex flex-wrap flex-col">
		<p>Select schedule to view</p>
		<p>reset filters</p>
		<select name="" id="">Professors  <option value="">Professors</option></select>
		<select name="" id="">Rooms  <option value="">Rooms</option></select>
		<select name="" id="">Courses  <option value="">Courses</option></select>
	</div>

	<div class="flex flex-wrap flex-col">
		<button
		type="button"
		class="btn bg-gradient-to-br variant-gradient-primary-secondary uppercase rounded-md text-sm mx-2 font-primary"
		on:click={handleUploadModal}>Add Schedules</button
	>
	<button
		type="button"
		class="btn bg-gradient-to-br variant-gradient-primary-secondary uppercase rounded-md text-sm mx-2 font-primary mr-3"
		on:click={handleUploadModal}>Edit Schedules</button
	>
	<button
	type="button"
	class="btn bg-gradient-to-br variant-gradient-primary-secondary uppercase rounded-md text-sm mx-2 font-primary mr-3"
	on:click={handleUploadCustomSuhedules}>Add Custom Schedules</button
	
>

	</div>

	</div>
	<!-- end sidebar -->
	<!-- calendar view -->
	 <div class="grow">
	<CalendarView />
</div>
</body>

	<!-- modals -->

	<!-- upload modal -->
	{#if isUploadModalActive}

		<div
			class="bg-black bg-opacity-50 w-full h-fit fixed top-0 left-0 min-h-full  flex justify-center"
		>
	
		<div class="relative">
			<!-- this is the submit button that I couldn't quite figure out where the right place to put it -->
			{#if csvData.length > 0}
			<!-- svelte-ignore empty-block -->
			{#await loadingPromise}
			{:then}
			<!-- this is the button that shows up when a user confirms their details, it is away from everything else for stylistic purposes -->
			<button type="submit" form="confirmedClasses" class="confirm-schedule btn variant-filled rounded-xl p-2 text-lg">Confirm Schedule</button>
			{/await}
			{/if}
			<!-- end submit block, start rest of content -->
			<div class="flex flex-wrap bg-white m-10 p-10 rounded-xl w-fit md:min-w-[620px] max-w-[620px] h-fit max-h-[600px] overflow-auto shadow-xl custom-scrollbar upload-modal">
				<button class="absolute top-8 right-[4.5%]  font-bold h-[30px] w-[30px] bg-red-500 p-2 rounded-full flex flex-col justify-center items-center shadow-2xl" on:click={handleUploadModal}><img src="/xmark-solid.svg" alt="close div"></button>
				{#if csvData.length < 1}
				<p class="w-full text-2xl text-uvu-green font-bold text-center m-5">Upload a Schedule</p>
				<form class="w-full" on:submit|preventDefault={parseCSV}>
					<button type="button" class=" w-full flex flex-wrap justify-center items-center">
					<label for="file-upload" class="custom-file-upload flex flex-col justify-center items-center">
						<img src="/arrow-up-solid.svg" alt="upload arrow" class="h-[80px] w-[80px] p-2 bg-uvu-green rounded-full cursor-pointer underline mb-6 hover:bg-[#00834d]">
						{#if fileName === "No file chosen"}
					<p>{fileName}</p>
					{:else}
					<p>Uploaded file: {fileName}</p>
					{/if}
					</label>
				</button>
					<input class="my-3 input text-black max-w-[620px] rounded-none bg-white border-2 !border-black" type="file" accept=".csv" name="fileUpload" id="file-upload" on:change={handleFileChange}/>
					<div class=" flex justify-center m-2">
					<button class="btn bg-gradient-to-br variant-gradient-primary-secondary" type="submit"
						>Upload</button>
					</div>
				</form>
				{/if}
				<!-- this is temporarily where the uploaded data is going -->
				{#if csvData.length > 0}
				{#await loadingPromise}
				<div class="w-full h-full bg-uvu-green rounded-lg flex flex-col justify-center items-center p-4">
				<h2 class="text-white text-2xl font-bold my-5">Loading...</h2>
				<ProgressRadial class='mb-5'/>
			</div>
				{:then}
	
			
				 <p class="w-full text-2xl text-uvu-green font-bold text-center mb-2">Confirm Imported Data</p>
				<form id="confirmedClasses" class="min-w-[400px] w-full" on:submit|preventDefault={confirmImportedCourses}>
					{#each csvData as row, index}
						{#if row.CRN}
							<div id="course-{index}" class="flex flex-wrap flex-col border border-[#275D38] mb-2 p-2 rounded-lg">
								<label for="name-{index}"><b>Course Catalog Name:</b></label>
								<input class="editable-input" type="text" id="name-{index}" name="name-{index}" required value={row.Course} />
								<label for="crn-{index}"><b>CRN:</b></label>
								<input class="editable-input" type="text" id="crn-{index}" name="crn-{index}" required value={row.CRN} />
								<!-- <label for="meeting-time-{index}"><b>Meeting Time:</b></label>
								<input class="editable-input" type="text" id="meeting-time-{index}" name="meeting-time-{index}" value={row['Meeting Pattern']} /> -->

								<!-- meeting day logic -->
								<fieldset>
									<legend class="font-bold">Meeting Days:</legend>
									{#each ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Online'] as day}
									<label>
									  <input type="checkbox" name="days[]" value={day}   checked={row.meetingDays.includes(day)}> 
									  {day}
									</label>
								  {/each}
									</fieldset>
								  <!-- end meeting day logic -->

								  <!-- meeting time logic -->
								<label class="font-bold" for="meeting-time-{index}">Meeting Time:</label>
								{#if row.meetingTime !== 'Does Not Meet'}
								<label class="w-full">
									<input type="checkbox" name="days[]" value='Does Not Meet' on:change={(event) => handleMeetingChange(event, row)}/>
									Does Not Meet
								</label>
								<div class="flex flex-wrap">
									<div class="flex flex-col mr-2">
										<label for="start-time-{index}"><b>Start Time:</b></label>
										<input class="editable-input" type="time" id="start-time-{index}" name="start-time-{index}"  value="{row.meetingTime[0]}"/>
									</div>
									<div class="flex flex-col">
										<label for="end-time-{index}"><b>End Time:</b></label>
										<input class="editable-input" type="time" id="end-time-{index}" name="end-time-{index}" value="{row.meetingTime[1]}" />
									</div>
								</div>
								{:else}
								<label class="w-full">
									<input type="checkbox" name="does-not-meet" value='Does Not Meet' on:change={(event) => handleMeetingChange(event, row)} checked/>
									Does Not Meet
								</label>
								{/if}
								<!-- end meeting time logic -->


								<label class="font-bold" for="instructor-{index}">Instructor(s):</label>
								<textarea class="editable-input" rows="2" id="instructor-{index}" name="instructor-{index}">{row.Instructor}</textarea>
								<label class="font-bold" for="building-room-{index}">Building and Room:</label>
								<input class="editable-input" type="text" id="building-room-{index}" name="building-room-{index}" value={row['Building and Room']} />
							</div>

						{/if}
					{/each}
						</form>
				{/await}
				{/if}
			
			
			</div>

			<!-- Import CSV button -->
			<div class="">
				<button class="px-6 py-1 bg-primary hover:bg-primaryDark rounded-full shadow-sm transition-all duration-300" on:click={toggleImportModal}>
					<div class="text-white flex items-center font-medium font-raj uppercase text-md md:text-sm transition-all duration-300">
						<i class="fa-solid fa-file-import py-0.5 md:pr-2 md:py-0"></i>
						<p class="hidden md:block">Import CSV</p>
					</div>
				</button>
				
				<div class="flex justify-center {importSelected} transition-all duration-300 translate-y-[6px]">
					<div class="basis-6/12  bg-primary h-[2px] rounded-full"></div>
				</div>
				<!-- <img src="upload.svg" alt="upload icon" class="w-10 h-10"> --> 
			</div>

			<!-- add button  -->
			<div>
				<button class="px-6 py-1 bg-primary hover:bg-primaryDark rounded-full shadow-sm transition-all duration-300" on:click={toggleModal}>
					<div class="text-white flex items-center font-medium font-raj uppercase text-md md:text-sm transition-all duration-300">
						<i class="fa-solid fa-circle-plus py-0.5 md:pr-2 md:py-0"></i>
						<p class="hidden md:block">Add Schedules</p>
					</div>
				</button>
				<div class="flex justify-center {addSelected} transition-all duration-300  translate-y-[6px]">
					<div class="basis-6/12  bg-primary h-[2px] rounded-full"></div>
				</div>
				<!-- <img src="add.svg" alt="Plus button called add" class="w-10 h-10">  -->
			</div>

			<!-- edit button  -->
			<div class="">
				<button class="px-6 py-1 bg-primary hover:bg-primaryDark rounded-full shadow-sm transition-all duration-300" on:click={toggleEditModal}>
					<div class="text-white flex items-center font-medium font-raj uppercase text-md md:text-sm transition-all duration-300">
						<i class="fa-solid fa-pen-to-square py-0.5 md:pr-2 md:py-0"></i>
						<p class="hidden md:block">Edit Schedules</p>
					</div>
				</button>
				<div class="flex justify-center {editSelected} transition-all duration-300 translate-y-[6px]">
					<div class="basis-6/12  bg-primary h-[2px] rounded-full"></div>
				</div>
				
			</div>

		</div><!-- end -->
		

		<div class="">
			<!-- listData from the database gets passed down as a prop to the scheduler -->
			<Calendar />
		</div>
	</div>
</div>

<style>
	@media print {
		.no-print {
			display: none;
		}
	}
</style>