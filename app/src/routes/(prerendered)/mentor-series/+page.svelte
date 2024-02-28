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
        class="font-asmbly font-light text-accent p-8 text-4xl text-center all-under"
    >
        Mentor Series
    </h1>
    <article class="prose lg:prose-lg text-wrap mx-8">
        <p>
            In addition to our other class offerings, Asmbly offers open-ended classes we call Mentor Series classes. 
            These classes are taught by highly experienced instructors and are tailored to the individual needs of the student. 
            Being open-ended classes, Mentor Series classes can be as long or short as needed, with a minimum length of 1 hour. 
            All Mentor Series classes cost $100/hr of instruction time. 
        </p>
        <p>
            The following are our most popular Mentor Series classes. To request a session, use the links under each section below. If none of these meet your needs, send us an email at <a href="mailto:mentor-series@asmbly.org">mentor-series@asmbly.org</a>
            with your request, and we'll get back to you.
        </p>
    </article>
    
    <ResponsiveCard let:Description let:Action let:Title let:Figure class="bg-base-200 w-full mt-16">
        <Figure>
            <enhanced:img src="$lib/images/DavidDiskoNew.jpg?aspect=0.8" 
            alt="Woodshop Mentor Series Instructor Charles Leininger" 
            class="w-full h-auto"/>
        </Figure>
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-32 lg:justify-center lg:w-full">
            <Title>
                Woodshop Mentor Series
            </Title>
            <Description>
                The Woodshop Mentor Series is taught by Asmbly Lead Instructor David Disko and professional woodworker Charles Leininger.
                To learn more or request a session, use one of the links below.
            </Description>
            <div class="flex items-center justify-start prose lg:prose-lg"><span class="material-symbols-outlined pr-2">mail</span><a class="underline" href="mailto:woodshop-mentor-series@asmbly.org">Request a session with David</a></div>
            <div class="flex items-center justify-start prose lg:prose-lg mt-2"><span class="material-symbols-outlined pr-2">content_paste</span><a class="underline" href="https://elementalwoodworks.as.me/woodshopmentorseries" target="_blank">Request a session with Charles</a></div>
        </div>
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Action let:Title let:Figure class="bg-base-100 w-full">
        {#if innerWidth < 720}
        <Figure>
            <enhanced:img src="$lib/images/CNCMentorPlaceholder.jpg" 
            alt="CNC routing a 3D design" 
            class="h-auto w-full"/>
        </Figure>
        {/if}
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-32 lg:justify-center lg:w-full left-padding">
            <Title>
                CNC Mentor Series
            </Title>
            <Description>
                The CNC Mentor Series is taught by James Freeman (VCarve) and Charles Leininger (Fusion 360). To learn more or request a session,
                use one of the links below.
            </Description>
            <div class="flex items-center justify-start prose lg:prose-lg"><span class="material-symbols-outlined pr-2">mail</span><a class="underline" href="mailto:cnc-mentor@asmbly.org">Request a session with James</a></div>
            <div class="flex items-center justify-start prose lg:prose-lg mt-2"><span class="material-symbols-outlined pr-2">content_paste</span><a class="underline" href="https://elementalwoodworks.as.me/?appointmentType=51622907" target="_blank">Request a session with Charles</a></div>
        </div>
        {#if innerWidth >= 720}
        <Figure>
            <enhanced:img src="$lib/images/CNCMentorPlaceholder.jpg" 
            alt="CNC routing a 3D design" 
            class="h-full w-auto"/>
        </Figure>
        {/if}
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Title let:Figure class="bg-base-200 w-full">
        <Figure>
            <enhanced:img src="$lib/images/GabriellePierce.jpg" 
            alt="Textiles Mentor Series Instructor Gabrielle Pierce" 
            class="w-full h-auto"/>
        </Figure>
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-32 lg:justify-center lg:w-full">
            <Title>
                Textiles Mentor Series
            </Title>
            <Description>
                The Textiles Mentor Series is taught by designer and maker Gabrielle Pierce. 
                To learn more or request a session, use the link below. 
            </Description>
            <div class="flex items-center justify-start prose lg:prose-lg"><span class="material-symbols-outlined pr-2">mail</span><a href="mailto:textiles-mentor-series@asmbly.org">Request a session with Gabrielle</a></div>
        </div>
    </ResponsiveCard>   
    <ResponsiveCard let:Description let:Title let:Figure class="bg-base-100 w-full">
        {#if innerWidth < 720}
        <Figure>
            <enhanced:img src="$lib/images/SavannaHarvey.jpg" 
            alt="Metal Shop Mentor Series Instructor Savanna Harvey" 
            class="w-full h-auto"/>
        </Figure>
        {/if}
        <div class="flex flex-col px-8 py-8 lg:pl-16 lg:py-32 lg:justify-center lg:w-full left-padding">
            <Title>
                Metal Shop Mentor Series
            </Title>
            <Description>
                The Metal Shop Mentor Series is taught by professional metalworker and maker Savanna Harvey.
                To learn more or request a session, use the link below. 
            </Description>
            <div class="flex items-center justify-start prose lg:prose-lg"><span class="material-symbols-outlined pr-2">mail</span><a href="mailto:metal-shop-mentor-series@asmbly.org">Request a session with Savanna</a></div>
        </div>
        {#if innerWidth >= 720}
        <Figure>
            <enhanced:img src="$lib/images/SavannaHarvey.jpg" 
            alt="Metal Shop Mentor Series Instructor Savanna Harvey" 
            class="h-full w-auto"/>
        </Figure>
        {/if}
    </ResponsiveCard>  
</div>

<style>
    @media screen and (min-width: 1440px) {
        .left-padding {
            padding-left: 20vw;
        }
    }
</style>