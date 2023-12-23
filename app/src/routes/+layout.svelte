<script>
	import logoWhite from '$lib/images/AsmblyLogoWhite.svg';
	import logoPurple from '$lib/images/AsmblyLogoPurple.svg';
	import '../app.css';
	import { page } from '$app/stores';

	let isDarkMode = undefined;
	let isSystemDefaultDark = undefined;

	if (typeof window !== 'undefined') {
		isSystemDefaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		isDarkMode =
			localStorage.getItem('theme') === 'dark' ||
			(!('theme' in localStorage) && isSystemDefaultDark);
	}

	function themeControl(currentTheme) {
		document.getElementById('themeControl').removeAttribute('open');
		switch (currentTheme) {
			case 'light':
				localStorage.setItem('theme', 'light');
				isDarkMode = false;
				document.documentElement.setAttribute('data-theme', 'asmbly');
				break;
			case 'dark':
				localStorage.setItem('theme', 'dark');
				isDarkMode = true;
				document.documentElement.setAttribute('data-theme', 'asmblyDark');
				break;
			case 'system':
				localStorage.removeItem('theme');
				isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
				if (isDarkMode) {
					document.documentElement.setAttribute('data-theme', 'asmblyDark');
				} else {
					document.documentElement.setAttribute('data-theme', 'asmbly');
				}
				break;
		}
	}

	const lightSVG = `<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					class="w-6 h-6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><circle cx="12" cy="12" r="5" /><path
						d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
					/></svg
				>`;

	const darkSVG = `<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					class="w-6 h-6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg
				>`;

	const systemSVG = `<svg 
					viewBox="0 0 24 24" 
					fill="none" 
					stroke="currentColor"
					class="w-6 h-6">
					<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" 
					stroke-width="2" 
					stroke-linejoin="round" 
					></path>
					<path d="M14 15c0 3 2 5 2 5H8s2-2 2-5" 
					stroke-width="2" 
					stroke-linecap="round" 
					stroke-linejoin="round" 
					></path>
					</svg>`;

	$: currentThemeSVG = isDarkMode ? darkSVG : lightSVG;

</script>

<nav class="flex justify-center shadow-lg h-16">
	<div class="navbar w-full max-w-7xl">
		<div class="navbar-start w-full lg:w-1/2">
			<a
				class="btn rounded-none btn-ghost hidden lg:flex"
				href={$page.url.pathname === '/' ? 'https://asmbly.org' : '/'}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 fill-current"
					fill="none"
					viewBox="0 -960 960 960"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"
					/></svg
				>
			</a>
			<details class="dropdown">
				<summary tabindex="0" role="button" class="btn rounded-none btn-ghost lg:hidden">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h8m-8 6h16"
						/></svg
					>
				</summary>
				<ul
					tabindex="0"
					class="menu menu-md rounded-none dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 text-base-content w-52"
				>
					<li><a class="font-asmbly font-light" href="/">Search for Classes</a></li>
					<li><a class="font-asmbly font-light" href="/my-classes">My Classes</a></li>
					<li><a class="font-asmbly font-light" href="/mentor-series">Mentor Series</a></li>
					<li><a class="font-asmbly font-light" href="/classes-faq">Classes FAQ</a></li>
					<li><a class="font-asmbly font-light" href="https://asmbly.org">Return to Main Site</a></li>
				</ul>
			</details>
			{#if isDarkMode}
				<a href="https://asmbly.org" class="m-4">
					<img src={logoWhite} alt="logo" class="h-8 w-auto" />
				</a>
			{:else}
				<a href="https://asmbly.org" class="m-4">
					<img src={logoPurple} alt="logo" class="h-8 w-auto" />
				</a>
			{/if}
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1">
				<li><a href="/" class="font-asmbly font-light text-md rounded-none">Search for Classes</a></li>
				<li><a href="/my-classes" class="font-asmbly font-light text-md rounded-none">My Classes</a></li>
				<li><a href="/mentor-series" class="font-asmbly font-light text-md rounded-none">Mentor Series</a></li>
				<li><a href="/classes-faq" class="font-asmbly font-light text-md rounded-none">Classes FAQ</a></li>
			</ul>
		</div>
		<div class="navbar-end m-2.5">
			<details id="themeControl" class="dropdown rounded-none">
				<summary tabindex="0" class="btn btn-ghost rounded-none m-1">
					{@html currentThemeSVG}
					<svg
						width="12px"
						height="12px"
						class="h-2 w-2 fill-current opacity-60 inline-block"
						stroke="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 2048 2048"
						><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" /></svg
					>
				</summary>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content z-[1] p-0 shadow-2xl bg-base-100 rounded-none w-36"
				>
					<li class="m-2">
						<button on:click={() => themeControl('light')} class="flex justify-start items-center btn btn-ghost btn-sm rounded-none w-full">
							<span class="mr-1">{@html lightSVG}</span>
							<span>Light</span>
						</button>
					</li>
					<li class="m-2">
						<button on:click={() => themeControl('dark')} class="flex justify-start items-center btn btn-ghost btn-sm rounded-none w-full">
							<span class="mr-1">{@html darkSVG}</span>
							<span>Dark</span>
						</button>
					</li>
					<li class="m-2">
						<button on:click={() => themeControl('system')} class="flex justify-start items-center btn btn-ghost btn-sm rounded-none w-full">
							<span class="mr-1">{@html systemSVG}</span>
							<span>System</span>
						</button>
					</li>
				</ul>
			</details>
		</div>
	</div>
</nav>
<slot />
