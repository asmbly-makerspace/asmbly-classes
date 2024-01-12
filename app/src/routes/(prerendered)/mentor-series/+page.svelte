<script>
    import ResponsiveCard from '$lib/components/ResponsiveCard.svelte';

    let innerWidth;
</script>

<svelte:window bind:innerWidth={innerWidth} />

<svelte:head>
	<title>Mentor Series</title>
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
    </article>
    
    <ResponsiveCard let:Description let:Action let:Title let:Figure class="bg-base-200 w-full mt-16">
        <Figure>
            <enhanced:img src="$lib/images/DavidDiskoNew.jpg" 
            alt="Woodshop Mentor Series Instructor" 
            class="w-full"/>
        </Figure>
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-8 lg:justify-center lg:w-full">
            <Title>
                Woodshop Mentor Series
            </Title>
            <Description>
                The Woodshop Mentor Series is taught by professional woodworker Charles Leininger. 
                Learn more and sign up for a session by clicking below.
            </Description>
            <Action>
                Sign up Here
            </Action>
        </div>
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Action let:Title let:Figure class="bg-base-100 w-full">
        {#if innerWidth < 720}
        <Figure>
            <enhanced:img src="$lib/images/CNCMentorPlaceholder.jpg" 
            alt="CNC Mentor Series Instructor" 
            class="w-full h-full"/>
        </Figure>
        {/if}
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-8 lg:justify-center lg:w-full left-padding">
            <Title>
                CNC Mentor Series
            </Title>
            <Description>
                The CNC Mentor Series is taught by James Freeman (VCarve) and Charles Leininger (Fusion 360). 
                To request a session with James, please email him at cnc-mentor@asmbly.org. 
                To request a session with Charles, please go to this scheduler link.
            </Description>
            <Action>
                Sign up Here
            </Action>
        </div>
        {#if innerWidth >= 720}
        <Figure>
            <enhanced:img src="$lib/images/CNCMentorPlaceholder.jpg" 
            alt="CNC Mentor Series Instructor" 
            class="w-full h-full"/>
        </Figure>
        {/if}
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Action let:Title let:Figure class="bg-base-200 w-full">
        <Figure>
            <enhanced:img src="$lib/images/GabriellePierce.jpg" 
            alt="Textiles Mentor Series Instructor" 
            class="w-full"/>
        </Figure>
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-8 lg:justify-center lg:w-full">
            <Title>
                Textiles Mentor Series
            </Title>
            <Description>
                The Textiles Mentor Series is taught by textile designer and stylist Gabrielle Pierce.
            </Description>
            <Action>
                Sign up Here
            </Action>
        </div>
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Action let:Title let:Figure class="bg-base-100 w-full">
        {#if innerWidth < 720}
        <Figure>
            <enhanced:img src="$lib/images/SavannaHarvey.jpg" 
            alt="Metal Shop Mentor Series Instructor" 
            class="w-full"/>
        </Figure>
        {/if}
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-8 lg:justify-center lg:w-full left-padding">
            <Title>
                Metal Shop Mentor Series
            </Title>
            <Description>
                The Metal Shop Mentor Series is taught by professional metalworker and maker Savanna Harvey.
            </Description>
            <Action>
                Sign up Here
            </Action>
        </div>
        {#if innerWidth >= 720}
        <Figure>
            <enhanced:img src="$lib/images/SavannaHarvey.jpg" 
            alt="Metal Shop Mentor Series Instructor" 
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