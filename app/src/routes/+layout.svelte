<script>
	import Logo from '$lib/components/logo.svelte';
	import LightThemeSVG from '$lib/components/lightThemeSVG.svelte';
	import DarkThemeSVG from '$lib/components/darkThemeSVG.svelte';
	import SystemThemeSVG from '$lib/components/systemThemeSVG.svelte';
	import '../app.css';
	import { page } from '$app/stores';
	import NewsletterSignup from '$lib/components/newsletter.svelte';
	import NewsletterEmail from '$lib/components/newsletterEmail.svelte';
	import { newsletterSchema } from '$lib/zodSchemas/schema.js';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation'

	export let data;

	let isDarkMode;
	let themeSelection = 'system';
	let details;
	let prevPage = 'https://asmbly.org'

	afterNavigate(nav => {
		if (nav.to.url.pathname === '/') {
			prevPage = 'https://asmbly.org'
		} else if (nav.from) {
			if (nav.from.url.pathname !== nav.to.url.pathname) prevPage = nav.from.url.href
		} else {
			prevPage = '/'
		}
	})

	if (browser) {
		isDarkMode = document.documentElement.getAttribute('data-theme') === 'asmblyDark';
		if (localStorage.getItem('theme')) {
			themeSelection = localStorage.getItem('theme');
		}

		details = [...document.querySelectorAll('details')];
		document.addEventListener('click', function(e) {
			if (!details.some(f => f.contains(e.target))) {
				details.forEach(f => f.removeAttribute('open'));
			} else {
				details.forEach(f => !f.contains(e.target) ? f.removeAttribute('open') : '');
			}
		})
	}

	function themeControl(currentTheme) {
		document.getElementById('themeControl').removeAttribute('open');
		switch (currentTheme) {
			case 'light':
				localStorage.setItem('theme', 'light');
				isDarkMode = false;
				themeSelection = 'light';
				document.documentElement.setAttribute('data-theme', 'asmbly');
				break;
			case 'dark':
				localStorage.setItem('theme', 'dark');
				isDarkMode = true;
				themeSelection = 'dark';
				document.documentElement.setAttribute('data-theme', 'asmblyDark');
				break;
			case 'system':
				localStorage.removeItem('theme');
				isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
				themeSelection = 'system';
				if (isDarkMode) {
					document.documentElement.setAttribute('data-theme', 'asmblyDark');
				} else {
					document.documentElement.setAttribute('data-theme', 'asmbly');
				}
				break;
		}
	}

	const closer = () => {
		document.getElementById('navDropdown').removeAttribute('open');
	}
</script>

<nav id="navbar" class="flex h-16 justify-center shadow-lg bg-base-100">
	<div class="navbar w-full max-w-7xl">
		<div class="navbar-start w-full lg:w-1/2">
			<a
				class="btn btn-ghost hidden rounded-none lg:flex"
				href={prevPage}
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
			<details id="navDropdown" class="dropdown">
				<summary class="btn btn-ghost rounded-none lg:hidden">
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
					class="menu dropdown-content menu-md z-[1] mt-3 w-52 rounded-none bg-base-100 p-2 text-base-content shadow"
				>
					<li><a on:click={() => closer()} class="font-asmbly uppercase" href="/">Search for Classes</a></li>
					<!-- <li><a on:click={() => closer()} class="font-asmbly uppercase" href="/my-classes">My Classes</a></li> -->
					<li>
						<a on:click={() => closer()} class="font-asmbly uppercase" href="/mentor-series">Mentor Series</a>
					</li>
					<li><a on:click={() => closer()} class="font-asmbly uppercase" href="/classes-faq">Classes FAQ</a></li>
					<li>
						<a class="font-asmbly uppercase" href="https://asmbly.org"
							>Return to Main Site</a
						>
					</li>
				</ul>
			</details>

			<a href="https://asmbly.org" class="m-4">
				<Logo fillColor='fill-accent' strokeColor='stroke-accent' height='h-8' class="w-auto"/>
			</a>
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1">
				<li>
					<a class="text-md rounded-none font-asmbly uppercase" href="/"
						>Search for Classes</a
					>
				</li>
				<!-- <li>
					<a class="text-md rounded-none font-asmbly uppercase" href="/my-classes"
						>My Classes</a
					>
				</li> -->
				<li>
					<a class="text-md rounded-none font-asmbly uppercase" href="/mentor-series"
						>Mentor Series</a
					>
				</li>
				<li>
					<a class="text-md rounded-none font-asmbly uppercase" href="/classes-faq"
						>Classes FAQ</a
					>
				</li>
			</ul>
		</div>
		<div id="themeController" class="navbar-end">
			<details id="themeControl" class="dropdown rounded-none">
				<summary class="btn btn-ghost m-1 rounded-none">
					{#if isDarkMode}
					<DarkThemeSVG strokeColor="stroke-current" />
					{:else}
					<LightThemeSVG strokeColor="stroke-current" />
					{/if}
					<svg
						width="12px"
						height="12px"
						class="inline-block h-2 w-2 fill-current opacity-60"
						stroke="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 2048 2048"
						><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" /></svg
					>
				</summary>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content relative right-0 z-[1] w-36 rounded-none bg-base-100 shadow-2xl"
				>
					<li class="m-2">
						<button
							on:click={() => themeControl('light')}
							class="btn btn-ghost btn-sm flex w-full items-center justify-start rounded-none"
						>
							<span class="mr-1"><LightThemeSVG strokeColor={themeSelection === 'light' ? 'stroke-[#0ea4e9]' : 'stroke-current'} /></span>
							<span class={themeSelection === 'light' ? 'text-[#0ea4e9]' : ''}>Light</span>
						</button>
					</li>
					<li class="m-2">
						<button
							on:click={() => themeControl('dark')}
							class="btn btn-ghost btn-sm flex w-full items-center justify-start rounded-none"
						>
							<span class="mr-1"><DarkThemeSVG strokeColor={themeSelection === 'dark' ? 'stroke-[#0ea4e9]' : 'stroke-current'} /></span>
							<span class={themeSelection === 'dark' ? 'text-[#0ea4e9]' : ''}>Dark</span>
						</button>
					</li>
					<li class="m-2">
						<button
							on:click={() => themeControl('system')}
							class="btn btn-ghost btn-sm flex w-full items-center justify-start rounded-none"
						>
							<span class="mr-1"><SystemThemeSVG strokeColor={themeSelection === 'system' ? 'stroke-[#0ea4e9]' : 'stroke-current'} /></span>
							<span class={themeSelection === 'system' ? 'text-[#0ea4e9]' : ''}>System</span>
						</button>
					</li>
				</ul>
			</details>
		</div>
	</div>
</nav>

<slot />


<div class="bg-primary p-5 lg:px-10 text-primary-content">
	<div class="pt-4 lg:pt-[50px] xs:px-12 lg:px-1">
		<div class="flex flex-wrap justify-start md:justify-center align-top">
			<div class="px-4 mb-12 xs:w-full md:w-1/4">
				<Logo fillColor='fill-secondary' strokeColor='stroke-secondary' height="auto" class="lg:max-w-[300px] w-full"/>
				<br><br><hr><br>
				<p class="text-secondary flex items-center"><span class="material-symbols-outlined pr-1">pin_drop</span>9701 Dessau Rd #304</p> <p class="text-secondary">Austin TX 78754 (<a class="underline text-secondary hover:text-[#fff]" href="https://www.google.com/maps?ll=30.353612,-97.671856&amp;z=10&amp;t=m&amp;hl=en-US&amp;gl=US&amp;mapclient=embed&amp;cid=5479436053178306069" target="_blank" rel="noopener">map</a>)</p><br>
				<div class="flex items-center justify-start"><span class="material-symbols-outlined pr-1">mail</span><a class="underline text-secondary hover:text-[#fff]" href="mailto:membership@asmbly.org">membership@asmbly.org</a></div>
			</div>
			<div class="px-4 mb-12 xs:w-full md:w-1/2">
				<div class="md:px-12">
					<NewsletterSignup
						action="/newsletter-signup?/newsletterSignup"
						data={data?.newsletterSignupForm}
						dataType="form"
						validators={newsletterSchema}
						let:form
						let:message
					>
						<div>
							<div>
								<div class="font-asmbly font-light text-secondary mb-6 text-3xl">Share Creativity</div>
							</div>
						</div>
						<div>
							<div>
								<div class="text-md text-secondary" data-paragraph="true">
									Whether you're in Austin or not, we'd love to stay connected and tell you about the cool
									stuff going on at Asmbly. We don't email often (usually only once a month), so we won't fill
									up your inbox.
								</div>
							</div>
						</div>
						<div
							class="mt-2"
						>
							<div>
								
					
								<div class="relative w-full py-4">
									<NewsletterEmail
										type="email"
										{form}
										field="email"
										label="Email Address"
										class="w-full"
									/>
								</div>
								
							</div>
					
							<div class="w-full py-1">
								<button
									type="submit"
									class="btn group flex w-full flex-col justify-center rounded-none bg-[#78CBC3] hover:bg-woodwork py-7 border-none"
								>
									<span class="font-asmbly font-bold text-xl text-[#000] transition-all uppercase"
										>Subscribe Now</span
									>
								</button>
							</div>
						</div>
						{#if message}
							<div
								class="status mt-4" class:text-error={message.status >= 400} 
								class:text-success={message.status < 300 || !message.status}
							>
								{message.text}
							</div>
						{/if}
					</NewsletterSignup>
				</div>
				
			</div>
			<div class="px-4 mb-12 xs:w-full md:w-1/4">
				<h3 class="font-asmbly font-light text-secondary mb-6 text-3xl">Helpful Links</h3>
				<p class="font-asmbly font-light text-secondary">Membership & Events</p>
				<ul>
					<li><a class="underline text-secondary hover:text-[#fff]" href="https://asmbly.org/join" target="_blank" rel="noopener">How to Join</a></li>
					<li><a class="underline text-secondary hover:text-[#fff]" href="https://asmbly.org/faq" target="_blank" rel="noopener">FAQ</a></li>
					<li><a class="underline text-secondary hover:text-[#fff]" href="/">Classes</a></li>
					<li><a class="underline text-secondary hover:text-[#fff]" href="https://asmbly.org/events" target="_blank" rel="noopener">Event Calendar</a></li>
				</ul>
				<br>
				<p class="font-asmbly font-light text-secondary">Member Links</p>
				<ul>
					<li><a class="underline text-secondary hover:text-[#fff]" href="https://asmbly.app.neoncrm.com" target="_blank" rel="noopener">Neon Member Portal</a></li>
					<li><a class="underline text-secondary hover:text-[#fff]" href="https://asmbly.skedda.com" target="_blank" rel="noopener">Skedda</a></li>
					<li><a class="underline text-secondary hover:text-[#fff]" href="https://yo.asmbly.org" target="_blank" rel="noopener">Discourse</a></li>
					<li><a class="underline text-secondary hover:text-[#fff]" href="https://wiki.asmbly.org" target="_blank" rel="noopener">Asmbly Wiki</a></li>
				</ul>
			</div>

		</div>
	</div>
</div>
<footer class="footer footer-center p-4 bg-[#000] text-base-content">
	<div>
		<p class="font-light text-xs text-primary-content">
			&copy; {new Date().getFullYear()} Asmbly Makerspace. All rights reserved.
		</p>
	</div>
</footer>
