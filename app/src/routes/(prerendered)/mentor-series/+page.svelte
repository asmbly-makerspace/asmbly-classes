<script>
    import ResponsiveCard from '$lib/components/ResponsiveCard.svelte';

    let innerWidth;
</script>

<svelte:window bind:innerWidth={innerWidth} />

<svelte:head>
	<title>Asmbly | Mentor Series</title>
	<meta name="description" content="Private, tailored classes offered by experienced Asmbly instructors on a request basis." />
    <meta name="keywords" content="private, classes, asmbly, mentor series" />
</svelte:head>

<div class="flex flex-col items-center justify-center">
    <h1
        class="font-asmbly text-accent p-8 text-4xl text-center all-under"
    >
        Mentor Series
    </h1>
    <article class="prose lg:prose-lg xl:prose-xl text-wrap mx-8">
        <p>
            In addition to our other class offerings, Asmbly offers open-ended classes we call Mentor Series classes. 
            These classes are taught by highly experienced instructors and are tailored to the individual needs of the student. 
            Being open-ended classes, Mentor Series classes can be as long or short as needed, with a minimum length of 1 hour. 
            All Mentor Series classes cost $100/hr of instruction time. 
        </p>
        <p>
            The following are our most popular Mentor Series classes. If none of these meet your needs, send us an email at <a href="mailto:mentor-series@asmbly.org">mentor-series@asmbly.org</a>
            with your request, and we'll get back to you.
        </p>
    </article>
    
    <ResponsiveCard let:Description let:Action let:Title let:Figure class="bg-base-200 w-full mt-16">
        <Figure>
            <enhanced:img src="$lib/images/DavidDiskoNew.jpg" 
            alt="Woodshop Mentor Series Instructor Charles Leininger" 
            class="w-full"/>
        </Figure>
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-8 lg:justify-center lg:w-full">
            <Title>
                Woodshop Mentor Series
            </Title>
            <Description>
                The Woodshop Mentor Series is taught by professional woodworker Charles Leininger and Asmbly Lead Instructor David Disko. 
                To request a session with David, please email him at <a href="mailto:woodshop-mentor-series@asmbly.org">woodshop-mentor-series@asmbly.org</a>.
                To request a session with Charles, please use the scheduler link below.
            </Description>
            <Action>
                <a href="https://elementalwoodworks.as.me/woodshopmentorseries" target="_blank">Sign up Here</a>
            </Action>
        </div>
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Action let:Title let:Figure class="bg-base-100 w-full">
        {#if innerWidth < 720}
        <Figure>
            <enhanced:img src="$lib/images/CNCMentorPlaceholder.jpg" 
            alt="CNC routing a 3D design" 
            class="w-full h-full"/>
        </Figure>
        {/if}
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-8 lg:justify-center lg:w-full left-padding">
            <Title>
                CNC Mentor Series
            </Title>
            <Description>
                The CNC Mentor Series is taught by James Freeman (VCarve) and Charles Leininger (Fusion 360). 
                To request a session with James, please email him at <a href="mailto:cnc-mentor@asmbly.org">cnc-mentor@asmbly.org</a>. 
                To request a session with Charles, please use the scheduler link below.
            </Description>
            <Action>
                <a href="https://elementalwoodworks.as.me/?appointmentType=51622907" target="_blank">Sign up Here</a>
            </Action>
        </div>
        {#if innerWidth >= 720}
        <Figure>
            <enhanced:img src="$lib/images/CNCMentorPlaceholder.jpg" 
            alt="CNC routing a 3D design" 
            class="w-full h-full"/>
        </Figure>
        {/if}
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Title let:Figure class="bg-base-200 w-full">
        <Figure>
            <enhanced:img src="$lib/images/GabriellePierce.jpg" 
            alt="Textiles Mentor Series Instructor Gabrielle Pierce" 
            class="w-full"/>
        </Figure>
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-8 lg:justify-center lg:w-full">
            <Title>
                Textiles Mentor Series
            </Title>
            <Description>
                The Textiles Mentor Series is taught by designer and maker Gabrielle Pierce. 
                To learn more or request a session, please send an email to <a href="mailto:textiles-mentor-series@asmbly.org">textiles-mentor-series@asmbly.org</a>.
            </Description>
        </div>
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Title let:Figure class="bg-base-100 w-full">
        {#if innerWidth < 720}
        <Figure>
            <enhanced:img src="$lib/images/SavannaHarvey.jpg" 
            alt="Metal Shop Mentor Series Instructor Savanna Harvey" 
            class="w-full"/>
        </Figure>
        {/if}
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-8 lg:justify-center lg:w-full left-padding">
            <Title>
                Metal Shop Mentor Series
            </Title>
            <Description>
                The Metal Shop Mentor Series is taught by professional metalworker and maker Savanna Harvey.
                To learn more or request a session, please send an email to <a href="mailto:metal-shop-mentor-series@asmbly.org">metal-shop-mentor-series@asmbly.org</a>.
            </Description>
        </div>
        {#if innerWidth >= 720}
        <Figure>
            <enhanced:img src="$lib/images/SavannaHarvey.jpg" 
            alt="Metal Shop Mentor Series Instructor Savanna Harvey" 
            class="w-full"/>
        </Figure>
        {/if}
    </ResponsiveCard>  
</div>

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
        }

    *::before, *::after {
        box-sizing: border-box;
        }

    @media screen and (min-width: 1440px) {
        .left-padding {
        padding-left: 20vw;
    }
    }
        
</style>