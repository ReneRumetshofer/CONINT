const status = document.getElementById("status");
const api_url = `http://${window.location.hostname}:3000`;

fetch(api_url + "/notes")
  .then((response) => response.json())
  .then((data) => {
    status.innerText = "Connection to API successfully established";
    console.log(data);
  })
  .catch((error) => {
    status.innerText = "Connection to API failed, see console log";
    console.log(error);
  });
