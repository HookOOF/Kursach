
export function displayError(error){
    document.getElementById("error").style.display = null;
    document.getElementById("errorMessage").innerHTML = error.message;
    document.getElementById("error").title = error.message;
    throw error;
}

export function clearError(){
    document.getElementById("error").style.display = "none";
}