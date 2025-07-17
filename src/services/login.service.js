export const login = async (loginData) => {
    console.log('loginData', loginData);
    try {
        const response = await fetch("http://localhost:8000/user/login", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(loginData)
        })
        const data = await response.json(); //il dato della risposta

        if (response.ok) {
            return data
        }
    } catch(error){
        console.error(error);
    }
}