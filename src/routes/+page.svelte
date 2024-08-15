<script lang="ts">
    import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
    import { askCreateRoom, askJoinRoom } from '$lib/roommanager.js'
    import { goto } from '$app/navigation'

    let group = "";
    let tabgroup = 0;
    let groupExists = "";

    async function createRoom(roomName: string) {
        const create = await askCreateRoom(roomName)
        if (create=="create-room-success") {
            goto(`/rooms/${roomName}`)
        } else {
            groupExists = `${roomName} already exists !`
            setTimeout(() => {
                groupExists = ""
            }, 3000);
        }
    }

    async function joinRoom(roomName: string) {
        const join = await askJoinRoom(roomName)
        if (join=="join-room-failure") {
            groupExists = `${roomName} doesn't exist !`
            setTimeout(() => {
                groupExists = ""
            }, 3000);
        } else {
            goto(`/rooms/${roomName}`)
        }
    }

</script>

<div class="mx-auto p-8 space-y-8">
	<h1 class="h1">Hello Skeleton</h1>
	<p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
	<section>
		<a class="btn variant-filled-primary" href="https://kit.svelte.dev/">SvelteKit</a>
		<a class="btn variant-filled-secondary" href="https://tailwindcss.com/">Tailwind</a>
		<a class="btn variant-filled-tertiary" href="https://github.com/">GitHub</a>
	</section>

    <div class="grid grid-cols-2 gap-4">
        <div class="card space-y-8">
            <TabGroup justify="justify-center">
                <Tab bind:group={tabgroup} name="tab1" value={0}>Create Group</Tab>
                <Tab bind:group={tabgroup} name="tab2" value={1}>Join Group</Tab>
                <!-- Tab Panels --->
                <svelte:fragment slot="panel">
                    {#if tabgroup === 0}
                        Create a group and link it to your friends !
                    {:else}
                        Join a group someone else created !
                    {/if}
                </svelte:fragment>
            </TabGroup>
            <div class="grid grid-cols-2 gap-10">
                <input class="input m-1" bind:value={group} >
                {#if tabgroup == 0}
                    <button class="btn variant-filled-primary" on:click={()=>createRoom(group)}>Create</button>
                {:else}
                    <button class="btn variant-filled-primary" on:click={()=>joinRoom(group)}>Join</button>
                {/if}
            </div>
            <footer class="card-footer">{groupExists}</footer>
        </div>

        <div class="card space-y-8">
            <header class="card-header h3 text-center">How to Play</header>
            <section class="p-4">(content)</section>
            <footer class="card-footer">(footer)</footer>
        </div>
    </div>

</div>
