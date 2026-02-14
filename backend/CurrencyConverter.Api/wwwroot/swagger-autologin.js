(async function() {
    const loginResponse = await fetch("/dev/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: "admin", Roles: ["Admin"] })
    });
    const data = await loginResponse.json();
    const token = data.token;

    window.ui.getConfigs().requestInterceptor = (request) => {
        request.headers['Authorization'] = `Bearer ${token}`;
        return request;
    };
})();
