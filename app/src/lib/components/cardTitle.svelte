<script>
    import { getContext } from 'svelte';

    const isDarkMode = getContext('isDarkMode');

    $: textColor = $isDarkMode ? 'text-base-content' : 'text-asmbly';
</script>

<h2 class="text-2xl lg:text-3xl font-asmbly {textColor} justify-start all-under w-max">
    <slot />
</h2>

<style>
    .all-under:after {
        content: " ";
        background: linear-gradient(300deg, #292d6a, #568ac8, #00916e, #78cbc3, #f2b51b, #ed6e24, #d33e42);
        background-size: 480% 480%;
        animation: gradient-x 64s ease infinite;
        height: 5px;
        display: block;
        width: 100%;
        margin-top: 0.5rem;
        box-sizing: border-box;
        }
</style>