<script>
	import logo from '$lib/images/AsmblyLogoWhite.png?enhanced';
	import '../app.css';
	import { page } from '$app/stores';
</script>

<nav class="flex justify-center bg-primary lg:rounded-box lg:rounded-full shadow-lg h-16 lg:mx-3 lg:mt-3">
<div class="navbar bg-primary text-primary-content rounded-box rounded-full w-full max-w-7xl">
	<div class="navbar-start w-full lg:w-1/2">
		<a class="btn btn-ghost hidden lg:flex" href={$page.url.pathname === '/' ? 'https://asmbly.org' : "/"}>
			<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 fill-primary-content"
					fill="none"
					viewBox="0 -960 960 960"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"
					/></svg>
		</a>
		<details class="dropdown">
			<summary tabindex="0" role="button" class="btn btn-ghost lg:hidden">
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
				class="menu menu-md dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 text-base-content rounded-box w-52"
			>
				<li><a href="/">Search for Classes</a></li>
				<li><a href="/my-classes">My Classes</a></li>
				<li><a href="/mentor-series">Mentor Series</a></li>
				<li><a href="/classes-faq">Classes FAQ</a></li>
				<li><a href="https://asmbly.org">Return to Main Site</a></li>
			</ul>
		</details>
		<a href="https://asmbly.org" class="m-4">
			<enhanced:img src={logo} alt="logo" class="h-8 w-auto" />
		</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/" class="text-md">Search for Classes</a></li>
			<li><a href="/my-classes" class="text-md">My Classes</a></li>
			<li><a href="/mentor-series" class="text-md">Mentor Series</a></li>
			<li><a href="/classes-faq" class="text-md">Classes FAQ</a></li>
		</ul>
	</div>
	<div class="navbar-end m-2.5">
		<label class="flex cursor-pointer gap-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><circle cx="12" cy="12" r="5" /><path
					d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
				/></svg
			>
			<input type="checkbox" value="asmblyDark" class="toggle theme-controller" />
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg
			>
		</label>
	</div>
</div>
</nav>
<slot />
