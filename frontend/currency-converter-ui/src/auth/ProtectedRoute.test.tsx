import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

const TestProtectedComponent = () => <div>Protected Content</div>;
const TestLoginComponent = () => <div>Login Page</div>;

const renderWithRouter = (initialToken: string | null = null) =>
    render(
        <AuthProvider initialToken={initialToken}>
            <MemoryRouter initialEntries={["/protected"]}>
                <Routes>
                    <Route path="/login" element={<TestLoginComponent />} />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <TestProtectedComponent />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );

describe("ProtectedRoute", () => {
    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    it("renders protected content when token exists", async () => {
        renderWithRouter("valid-token");

        const el = await screen.findByText("Protected Content");
        expect(el).toBeInTheDocument();
    });

    it("redirects to login when token is missing", async () => {
        renderWithRouter(null);

        const el = await screen.findByText("Login Page");
        expect(el).toBeInTheDocument();
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("redirects to login when token is cleared", async () => {
        // First render with valid token
        renderWithRouter("valid-token");

        // Re-render with cleared token (simulate logout)
        cleanup(); // remove previous tree
        renderWithRouter(null);

        // Assert login page is visible
        const el = await screen.findByText("Login Page");
        expect(el).toBeInTheDocument();
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

});
