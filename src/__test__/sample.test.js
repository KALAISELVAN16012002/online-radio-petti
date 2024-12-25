import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import Header from "../core/header";

test('this is for test', () => {
    render(<Header />);
    expect(screen.getByText(/Homes/)).toBeInTheDocument();
});
