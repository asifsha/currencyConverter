// src/auth/AuthContext.test.tsx
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";

// --- Test Components ---
const TestComponent = () => {
    const { token, login, logout } = useAuth();

    return (
        <div>
            <div data-testid="token">{token || "no-token"}</div>
            <button onClick={() => login("test-token")}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

// Helper to render inside provider
const renderWithAuth = (component: React.ReactNode) => {
    return render(<AuthProvider>{component}</AuthProvider>);
};

// Minimal ErrorBoundary for testing hooks outside provider
class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
    public error: any = null;

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any) {
        this.error = error;
    }

    render() {
        if (this.error) return null; // avoid rendering the error object
        return this.props.children;
    }
}

describe("AuthContext", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("provides auth context to children", () => {
        renderWithAuth(<TestComponent />);
        expect(screen.getByTestId("token")).toBeInTheDocument();
    });

    it("initializes with null token when localStorage is empty", () => {
        renderWithAuth(<TestComponent />);
        expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    });

    it("initializes with token from localStorage", () => {
        localStorage.setItem("token", "existing-token");
        renderWithAuth(<TestComponent />);
        expect(screen.getByTestId("token")).toHaveTextContent("existing-token");
    });

    it("stores token in localStorage on login", async () => {
        const user = userEvent.setup();
        renderWithAuth(<TestComponent />);
        const loginButton = screen.getByRole("button", { name: "Login" });
        await user.click(loginButton);
        expect(localStorage.getItem("token")).toBe("test-token");
    });

    it("updates token state on login", async () => {
        const user = userEvent.setup();
        renderWithAuth(<TestComponent />);
        await user.click(screen.getByRole("button", { name: "Login" }));
        expect(screen.getByTestId("token")).toHaveTextContent("test-token");
    });

    it("removes token from localStorage on logout", async () => {
        const user = userEvent.setup();
        localStorage.setItem("token", "existing-token");
        renderWithAuth(<TestComponent />);
        await user.click(screen.getByRole("button", { name: "Logout" }));
        expect(localStorage.getItem("token")).toBeNull();
    });

    it("clears token state on logout", async () => {
        const user = userEvent.setup();
        localStorage.setItem("token", "existing-token");
        renderWithAuth(<TestComponent />);
        expect(screen.getByTestId("token")).toHaveTextContent("existing-token");
        await user.click(screen.getByRole("button", { name: "Logout" }));
        expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    });

});
