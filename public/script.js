async function generateReading() {
  const button = document.getElementById("generate-reading");
  const preloader = document.querySelector('.preloader');
  button.disabled = true;
  preloader.classList.add('show');
  const userQuestion = document.getElementById("user-question").value;
  try {
    const response = await fetch("/bright-interpretation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: userQuestion }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayInterpretation(data.interpretation);
  } catch (error) {
    console.error("Error fetching interpretation:", error);
  } finally {
    button.disabled = false;
    preloader.classList.remove('show');
  }
}

function displayInterpretation(text) {
  const interpretationDiv = document.getElementById("interpretation");
  const brightPerspectiveTitle = document.getElementById("bright-perspective-title");
  brightPerspectiveTitle.style.display = 'block';
  interpretationDiv.textContent = text;
  interpretationDiv.classList.add("fade-in-up");
  brightPerspectiveTitle.classList.add("fade-in-up");
  setTimeout(() => {
    interpretationDiv.classList.remove("fade-in-up");
    brightPerspectiveTitle.classList.remove("fade-in-up");
  }, 500);
}

document.getElementById("generate-reading").addEventListener("click", generateReading);
document.getElementById("user-question").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    generateReading();
  }
});
