export default function fetchPost(url, request) {
    const token = btoa("admin:2707");

    const data = fetch("http://localhost:5007" + url, ({...request, 
        method: "POST",
        headers: { "Content-Type" : "application/json", "Authorization": `Basic ${token}` }
    }))
    .then((response) => response.json())
    .catch((error) => console.error(error));
    return data;
}