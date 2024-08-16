<script>
    import { onDestroy } from 'svelte'
    import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'
    import { getRoomMembers, sendReady, sendType, sendChoice, joinTrigger, leaveTrigger, masterTrigger, memberReadyTrigger, resetReadyTrigger, gameTrigger, typeTrigger, gameInfoTrigger, gameResultTrigger } from '$lib/roommanager.js'

    // load
    export let data;
    const room = data.room

    // name generator
    const config = {
        dictionaries : [adjectives, colors, animals],
        separator: '-',
        length: 2,
    }
    let name = uniqueNamesGenerator(config)

    // isMaster
    $: isMaster = ($masterTrigger == data.myId)

    // room joining
    let roomMembers = data.roomMembers
    const join = joinTrigger.subscribe((member) => {
        if (member) {
            roomMembers = [...roomMembers, member]
        }
    })
    onDestroy(join)

    // leaving member
    let leave = leaveTrigger.subscribe((member) => {
        if (member) {
            roomMembers = roomMembers.filter((ids) => { return ids != member })
        }
    })
    onDestroy(leave)

    // someone sends its agreement
    let agree = memberReadyTrigger.subscribe((member) => {
        if (member) {
            document.getElementById(member).querySelectorAll("#indicator")[0].classList.remove("bg-red-600")
            document.getElementById(member).querySelectorAll("#indicator")[0].classList.add("bg-green-600")
        }
    })
    onDestroy(agree)

    // reset readys
    let resetReady = resetReadyTrigger.subscribe(() => {
        const indicators = document.querySelectorAll("#indicator")
        indicators.forEach((indicator) => {
            indicator.classList.remove("bg-green-600")
            indicator.classList.add("bg-red-600")
        })
    })
    onDestroy(resetReady)

    // someone sends its agreement
    let gameUpdate = gameInfoTrigger.subscribe((info) => {
        if (info) {
            switch($gameTrigger) {
                case "straw":
                    const straws = document.querySelectorAll("#straw")
                    straws[info[1]].setAttribute("disabled", true)
                    break
                case "rps":
                    break
                default:
                    break
            }
        }
    })
    onDestroy(gameUpdate)

    let gameResolve = gameResultTrigger.subscribe((resolve) => {
        if (resolve) {
            switch($gameTrigger) {
                case "straw":
                    const straws = document.querySelectorAll("#straw")
                    straws[resolve[1]].classList.add("bg-red-600")
                    straws[resolve[1]].classList.remove("variant-filled-secondary")
                    break
                case "rps":
                    if(typeof(resolve)=='object') {
                        console.log("object")
                        if(resolve.includes(data.myId)) {
                            console.log("lost")
                            const rpsButton = document.querySelectorAll("#rps-button")
                            rpsButton.forEach((btn)=>{
                                btn.disabled=true
                            })
                        }
                    }
                    break
                default:
                    break
            }
        }
    })
    onDestroy(gameResolve)

</script>


<div class="h-full p-8">
    <div class="card h-full grid grid-rows-4 p-4">
        <div class="grid grid-flow-col space-x-4">
            {#each roomMembers as roomMember}
                <div id="{roomMember}" class="card grid place-items-center">
                    {#if $masterTrigger == roomMember}
                        <div class="badge-icon">Master</div>
                    {/if}
                    <header class="card-header">{roomMember}</header>
                    {#if roomMember == data.myId}
                        <button class="btn variant-filled-tertiary" on:click={()=>sendReady(room)}>Ready</button>
                    {/if}
                    <div id="indicator" class="flex size-6 rounded-full bg-red-600"></div>
                </div>
            {/each}
        </div>
        <div class="card row-span-3 my-4 p-4">
            {#if isMaster}
                <div class="flex justify-center">
                    <button type="button" class="btn-icon variant-filled-secondary" on:click={()=>sendType(room, "coin")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
                          <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                              <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
                        </svg>
                    </button>
                    <button class="btn-icon variant-filled-secondary" on:click={()=>sendType(room, "straw")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
                          <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                        </svg>
                    </button>
                    <button type="button" class="btn-icon variant-filled-secondary" on:click={()=>sendType(room, "rps")}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            {/if}
            {#if $typeTrigger == "coin"}
                <div class="h3 flex justify-center">Head or Tails</div>
            {:else if $typeTrigger == "straw"}
                <div class="h3 flex justify-center">Last Straw</div>
            {:else}
                <div class="h3 flex justify-center">RPS</div>
            {/if}
            {#if $gameTrigger == "coin"}
                <div class="h-full flex justify-center place-items-center">{$gameInfoTrigger}</div>
            {:else if $gameTrigger == "straw"}
                <div>
                {#each roomMembers as roomMember, i}
                    <button id="straw" class="btn variant-filled-secondary" on:click={()=>{sendChoice(room, data.myId, i, "straw")}}>{i}</button>
                {/each}
                </div>
                {#if $gameResultTrigger}
                    <div class="h-full flex justify-center place-items-center">{$gameResultTrigger[0]}</div>
                {/if}
            {:else if $gameTrigger == "rps"}
                <button id="rps-button" class="btn variant-filled-secondary" on:click={()=>sendChoice(room, data.myId, "rock", "rps")}>Rock</button>
                <button id="rps-button" class="btn variant-filled-secondary" on:click={()=>sendChoice(room, data.myId, "paper", "rps")}>Paper</button>
                <button id="rps-button" class="btn variant-filled-secondary" on:click={()=>sendChoice(room, data.myId, "scissors", "rps")}>Scissors</button>
                {#if typeof($gameResultTrigger)=='string'}
                    <div class="h-full flex justify-center place-items-center">{$gameResultTrigger}</div>
                {/if}
            {/if}
        </div>
    </div>
</div>
