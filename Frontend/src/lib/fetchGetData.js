export default function fetchGet(url) {
    const token = btoa("admin:2707");
    const data = fetch("http://localhost:5007" + url, {
        method: "GET",
        headers: { "Authorization": `Basic ${token}` }
    })
    .then((response) => response.json())
    .catch((error) => console.error(error));
    return data;
}