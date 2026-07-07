const API_URL = "http://localhost:8080/api/auth";

export const api = {
    async login(data) {
        const response = await fetch(
            `${API_URL}/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Đăng nhập thất bại"
            );
        }

        localStorage.setItem(
            "token",
            result.token
        );

        return result;
    },

    async loginGoogle(data) {
        const response = await fetch(
            `${API_URL}/google`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Đăng nhập bằng Google thất bại"
            );
        }

        localStorage.setItem(
            "token",
            result.token
        );

        return result;
    },

    async register(data) {
        const response = await fetch(
            `${API_URL}/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Đăng ký thất bại"
            );
        }

        return result;
    },

    async logout() {
        localStorage.removeItem(
            "token"
        );
        localStorage.removeItem(
            "currentUser"
        );
    },

    async resetPassword(data) {
        const response = await fetch(
            `${API_URL}/reset-password`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            let errorMessage = text;
            try {
                const result = JSON.parse(text);
                errorMessage = result.message || result.error || text;
            } catch (e) {}
            
            throw new Error(errorMessage || "Đặt lại mật khẩu thất bại");
        }

        return true;
    },
};