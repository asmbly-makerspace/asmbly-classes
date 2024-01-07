/** @type {import('./$types').PageLoad} */
export async function load({setHeaders}) {
    setHeaders({
        'cache-control': 'max-age=300',
    })
}