<script lang="ts">
    import '../flush.postcss';
	import '../app.postcss';

    // Skeleton Components
    import { AppShell, AppBar } from '@skeletonlabs/skeleton'
</script>


<AppShell>
	<svelte:fragment slot="header">
        <AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
            <svelte:fragment slot="lead">(icon)</svelte:fragment>
            <h1 class="h1 text-6xl tracking-widest font-bold">Settle It !</h1>
            <svelte:fragment slot="trail">(actions)</svelte:fragment>
        </AppBar>
    </svelte:fragment>
	<!-- <svelte:fragment slot="sidebarLeft">Sidebar Left</svelte:fragment>
	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->
	<slot />
	<svelte:fragment slot="pageFooter">Page Footer</svelte:fragment>
	<!-- (footer) -->
</AppShell>
