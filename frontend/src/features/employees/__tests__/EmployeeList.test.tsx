import { useState, useMemo } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../../app/store';
import { EmployeeList } from '../EmployeeList';
import { describe, it, expect } from 'vitest';

describe('EmployeeList Component', () => {
  it('renders loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EmployeeList />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/Loading employees.../i)).toBeInTheDocument();
  });
});
