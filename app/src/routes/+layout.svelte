<script>
	import logoWhite from '$lib/images/AsmblyLogoWhite.svg';
	import logoPurple from '$lib/images/AsmblyLogoPurple.svg';
	import '../app.css';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import { setContext, onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import NewsletterSignup from '$lib/components/newsletter.svelte';
	import NewsletterEmail from '$lib/components/newsletterEmail.svelte';
	import { newsletterSchema } from '$lib/zodSchemas/schema.js';

	export let data;

	afterNavigate(() => {
		// Scroll to top
		const navbar = document.getElementById('navbar');
		window.scrollIntoView(navbar, { behavior: 'smooth', block: 'start', inline: 'nearest' });
	});

	const isDarkMode = writable(undefined);

	onMount(() => {
		isDarkMode.set(document.documentElement.getAttribute('data-theme') === 'asmblyDark');
	});

	function themeControl(currentTheme) {
		document.getElementById('themeControl').removeAttribute('open');
		switch (currentTheme) {
			case 'light':
				localStorage.setItem('theme', 'light');
				isDarkMode.set(false);
				document.documentElement.setAttribute('data-theme', 'asmbly');
				break;
			case 'dark':
				localStorage.setItem('theme', 'dark');
				isDarkMode.set(true);
				document.documentElement.setAttribute('data-theme', 'asmblyDark');
				break;
			case 'system':
				localStorage.removeItem('theme');
				isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
				if ($isDarkMode) {
					document.documentElement.setAttribute('data-theme', 'asmblyDark');
				} else {
					document.documentElement.setAttribute('data-theme', 'asmbly');
				}
				break;
		}
	}

	setContext('isDarkMode', isDarkMode);

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

	$: currentThemeSVG = $isDarkMode ? darkSVG : lightSVG;
</script>

<nav id="navbar" class="flex h-16 justify-center shadow-lg bg-base-100">
	<div class="navbar w-full max-w-7xl">
		<div class="navbar-start w-full lg:w-1/2">
			<a
				class="btn btn-ghost hidden rounded-none lg:flex"
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
				<summary tabindex="0" role="button" class="btn btn-ghost rounded-none lg:hidden">
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
					class="menu dropdown-content menu-md z-[1] mt-3 w-52 rounded-none bg-base-100 p-2 text-base-content shadow"
				>
					<li><a class="font-asmbly font-light uppercase" href="/">Search for Classes</a></li>
					<li><a class="font-asmbly font-light uppercase" href="/my-classes">My Classes</a></li>
					<li>
						<a class="font-asmbly font-light uppercase" href="/mentor-series">Mentor Series</a>
					</li>
					<li><a class="font-asmbly font-light uppercase" href="/classes-faq">Classes FAQ</a></li>
					<li>
						<a class="font-asmbly font-light uppercase" href="https://asmbly.org"
							>Return to Main Site</a
						>
					</li>
				</ul>
			</details>
			{#if $isDarkMode}
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
				<li>
					<a class="text-md rounded-none font-asmbly font-light uppercase" href="/"
						>Search for Classes</a
					>
				</li>
				<li>
					<a class="text-md rounded-none font-asmbly font-light uppercase" href="/my-classes"
						>My Classes</a
					>
				</li>
				<li>
					<a class="text-md rounded-none font-asmbly font-light uppercase" href="/mentor-series"
						>Mentor Series</a
					>
				</li>
				<li>
					<a class="text-md rounded-none font-asmbly font-light uppercase" href="/classes-faq"
						>Classes FAQ</a
					>
				</li>
			</ul>
		</div>
		<div class="navbar-end m-2.5">
			<details id="themeControl" class="dropdown rounded-none">
				<summary tabindex="0" class="btn btn-ghost m-1 rounded-none">
					{@html currentThemeSVG}
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
							<span class="mr-1">{@html lightSVG}</span>
							<span>Light</span>
						</button>
					</li>
					<li class="m-2">
						<button
							on:click={() => themeControl('dark')}
							class="btn btn-ghost btn-sm flex w-full items-center justify-start rounded-none"
						>
							<span class="mr-1">{@html darkSVG}</span>
							<span>Dark</span>
						</button>
					</li>
					<li class="m-2">
						<button
							on:click={() => themeControl('system')}
							class="btn btn-ghost btn-sm flex w-full items-center justify-start rounded-none"
						>
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


<div class="bg-primary p-12 text-primary-content">
	<div class="pt-[50px] xs:px-12 lg:px-1">
		<div class="flex flex-wrap justify-start md:justify-center align-top">
			<div class="px-4 mb-12 xs:w-full md:w-1/4">
				<img class="lg:max-w-[182px]" src="{logoWhite}" alt="Asmbly Logo">
				<br><br><hr><br>
				<i class="fa fa-map-marker-alt" aria-hidden="true"></i> 9701 Dessau Rd #304 <br>Austin TX 78754 (<a class="underline hover:text-[#fff]" href="https://www.google.com/maps?ll=30.353612,-97.671856&amp;z=10&amp;t=m&amp;hl=en-US&amp;gl=US&amp;mapclient=embed&amp;cid=5479436053178306069" target="_blank" rel="noopener">map</a>)<br><br>
				<i class="fa fa-envelope" aria-hidden="true"></i> <a class="underline hover:text-[#fff]" href="mailto:membership@asmbly.org">membership@asmbly.org</a>

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
								<div class="font-asmbly mb-6 text-3xl">Share Creativity</div>
							</div>
						</div>
						<div>
							<div>
								<div class="text-md" data-paragraph="true">
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
									class="btn group flex w-full flex-col justify-center rounded-none bg-[#78CBC3] py-7 border-none"
								>
									<span class="font-asmbly group-hover:text-secondary text-2xl text-[#000]"
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
				<h3 class="font-asmbly mb-6 text-3xl">Helpful Links</h3>
				<p class="font-asmbly">Membership & Events</p>
				<ul>
					<li><a class="underline hover:text-[#fff]" href="https://asmbly.org/how-to-join-asmbly" target="_blank" rel="noopener">How to Join</a></li>
					<li><a class="underline hover:text-[#fff]" href="https://asmbly.org/faq" target="_blank" rel="noopener">FAQ</a></li>
					<li><a class="underline hover:text-[#fff]" href="/">Classes</a></li>
					<li><a class="underline hover:text-[#fff]" href="https://asmbly.org/calendar" target="_blank" rel="noopener">Event Calendar</a></li>
				</ul>
				<br>
				<p class="font-asmbly">Member Links</p>
				<ul>
					<li><a class="underline hover:text-[#fff]" href="https://asmbly.app.neoncrm.com" target="_blank" rel="noopener">Neon Member Portal</a></li>
					<li><a class="underline hover:text-[#fff]" href="https://asmbly.skedda.com" target="_blank" rel="noopener">Skedda</a></li>
					<li><a class="underline hover:text-[#fff]" href="https://yo.asmbly.org" target="_blank" rel="noopener">Discourse</a></li>
					<li><a class="underline hover:text-[#fff]" href="https://wiki.asmbly.org" target="_blank" rel="noopener">Asmbly Wiki</a></li>
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
