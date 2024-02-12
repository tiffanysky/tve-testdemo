addEventListener('fetch', (event) => {
    console.log("Listener Capture Request")
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {

    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)

    console.log("This is my URL " + url)
    console.log("This is my PATH SEGMENTS " + pathSegments)

    // // Extract user information from Cloudflare request headers
    // const email = request.headers.get('cf-access-authenticated-user-email')

    // Cf-Access-Authenticated-User-Email
    const email = request.headers.get('Cf-Access-Authenticated-User-Email')

    const timestamp = new Date().toISOString()
    // const country = request.headers.get('cf-ipcountry')

    const country = request.cf.country

    console.log("Country Code " + country)

    const countryLink = `<a href="/secure/${country.toLowerCase()}">${country}</a>`
    const responseBody = `<html><body>${email} authenticated at ${timestamp} from ${countryLink}</body></html>`

    console.log("PATH LENGTH " + pathSegments.length )
    console.log("PATH [0] " + pathSegments[0])



// // This is the /secure path
if (pathSegments.length === 1 && pathSegments[0] === 'secure') {

    console.log("In secure path .......")

    return new Response( responseBody, {
                headers: { 'Content-Type': 'text/html' }, 
            })
}




// This is the /secure/${country} path
if (pathSegments.length === 2 && pathSegments[0] === 'secure') {
    
    const countryParam = pathSegments[1] // get the second url param -- i.e. my

    console.log("Country Params " + pathSegments[1])



    try {
        // Fetch the country flag from the private R2 bucket
        // const flagBuffer = await country_buckets.get('${countryParam}.png', 'arrayBuffer')

        // ---- For example, the request URL my-worker.account.workers.dev/image.png
        // const url = new URL(request.url);
        // const key = url.pathname.slice(1);
        // ---- Retrieve the key "image.png"
        // const object = await env.MY_BUCKET.get(key);

        const flagBuffer = await country_buckets.get(`${countryParam}.png`)

        // const key = "my.png"

        // const flagBuffer = await country_buckets.get(key)

        console.log("FLAG BUFFER " + flagBuffer)

        if (flagBuffer === null) {
              return new Response('ERROR : The Country flag returned GET value IS NULL', {
                status: 404,
                headers: { 'Content-Type': 'text/plain', },
            });
        }

        const flagResponse = new Response(flagBuffer.body, {
            headers: { 'Content-Type': 'image/png', },
        })

        return flagResponse


        // const headers = new Headers();
        // flagBuffer.writeHttpMetadata(headers);
        // headers.set('etag', flagBuffer.httpEtag);
    
        // return new Response(flagBuffer.body, {
        //     headers: { 'Content-Type': 'image/png', },
        // });



    } catch (error) {

        console.log(error)

        // Handle errors (e.g., country flag not found)
        return new Response('ERROR : The Country flag was not found', {
            status: 404,
            headers: { 'Content-Type': 'text/plain', },
        });
    }



}



// // Return a simple response for other paths
return new Response(responseBody, {
        headers: { 'Content-Type': 'text/html' },
    })

}







// export default {
//     async fetch(request, env) {

//       const url = new URL(request.url);
//     //   const key = url.pathname.slice(1);

//       const key = 'malaysia.png'
  
//       switch (request.method) {
//         case 'PUT':
//           await env.country_buckets.put(key, request.body);
//           return new Response(`Put ${key} successfully!`);


          
//         case 'GET':
//           const object = await env.country_buckets.get(key);
  
//           if (object === null) {
//             return new Response('Object Not Found', { status: 404 });
//           }
  
//           const headers = new Headers();
//           object.writeHttpMetadata(headers);
//           headers.set('etag', object.httpEtag);
  
//           return new Response(object.body, {
//             headers,
//           });


//         case 'DELETE':
//           await env.country_buckets.delete(key);
//           return new Response('Deleted!');
  
//         default:
//           return new Response('Method Not Allowed', {
//             status: 405,
//             headers: {
//               Allow: 'PUT, GET, DELETE',
//             },
//           });
//       }
//     },
//   };