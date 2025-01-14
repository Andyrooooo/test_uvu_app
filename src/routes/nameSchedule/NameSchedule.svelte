<script lang="ts">

    function saveScheduleName(event) {
        if (event.key === 'Enter') {
            console.log(event.target.value)
        }
    }

</script>

<!-- Name Schedule input -->
<div class="flex">
    <p class="text-primary font-raj text-md md:text-sm">Name:</p>
    <input type="text" class="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={""} on:keydown={saveScheduleName}>
</div>