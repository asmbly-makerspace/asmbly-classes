<script>
	import '../app.css';
	import logo from '$lib/images/AsmblyLogoWhite.png';
</script>

<nav class="flex justify-center bg-primary rounded-box rounded-full shadow-lg h-16 mx-3 mt-3">
<div class="navbar bg-primary text-primary-content rounded-box rounded-full w-full max-w-7xl">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
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
			</div>
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
			>
				<li><a href="/">Search for Classes</a></li>
				<li><a href="/my-classes">My Classes</a></li>
				<li><a href="/checkout">Private and Checkout Classes</a></li>
			</ul>
		</div>
		<a href="https://asmbly.org" class="m-4">
			<img src={logo} alt="logo" class="h-8" />
		</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/" class="text-md">Search for Classes</a></li>
			<li><a href="/my-classes" class="text-md">My Classes</a></li>
			<li><a href="/checkout" class="text-md">Private and Checkout Classes</a></li>
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
