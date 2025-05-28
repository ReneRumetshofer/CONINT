const status = document.getElementById("status");

fetch("/notes")
  .then((response) => response.json())
  .then((data) => {
    status.innerText = "Connection to API successfully established";
    console.log(data);
  })
  .catch((error) => {
    status.innerText = "Connection to API failed, see console log";
    console.log(error);
  });
