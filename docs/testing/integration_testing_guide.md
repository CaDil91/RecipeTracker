# Integration Testing Quick Reference Guideline

## Core Principles:

### "Test how components work together"

### Integration Test Classification (Fowler's Framework)

**Fowler's Integration Categories (80-90% Narrow, 10-20% Broad):**

**Narrow Integration (80-90% - Default Choice):**
- Single external dependency (one database, one API, one message queue)
- Fast, focused, easy to debug

**Component Tests:**
- Service isolation with controlled dependencies
- Real internal dependencies, test doubles for external services
- **More critical for microservices** than monolithic applications

**Contract Tests:**
- Verify interface agreements between services
- Consumer-driven contracts prevent breaking changes
- **Essential for microservices**, less relevant for monoliths

**Broad Integration (10-20% - Use Sparingly):**
- Multiple components working together end-to-end
- Only for critical business workflows, regulatory requirements
- **Subcutaneous tests**: Just below UI layer for end-to-end validation

### When to Use Real vs Test Doubles

**✅ Use Real:** The ONE external dependency being tested, fast internal services, in-memory alternatives

**⚠️ Use Test Doubles:** Multiple external dependencies, slow/unreliable systems, expensive APIs, complex setup

**Test Double Types:** Fake (simplified implementation), Stub (predefined responses), Mock (verifies interactions), Spy (records calls)

### Test Data Strategy

**Database Tests:** Dedicated test DB, test data builders, cleanup strategy, avoid shared test data
**External Services:** Test endpoints, contract stubs, record/replay tools

### Anti-Patterns & Maintenance Reality

**Fowler's Warnings:** 
- *"Don't use integration tests as a substitute for missing unit tests. Integration tests should test integration, not business logic."*
- *"Every integration test should justify its maintenance cost. When integration tests break frequently, teams lose confidence in the build."*

**What NOT to Test:** Individual business logic, full user workflows, performance under load

**Maintenance Impact:** Integration tests are **more fragile** than unit tests. Prioritize **build reliability** over comprehensive coverage.

## Test Strategy

### For any integration, ask:
- **Risk-Based Priority:** Test critical integration points first: payment systems, data persistence, authentication flows, external APIs, core business workflows
- **Happy path**: Normal data flow works? - *Test the primary integration scenario*
- **Contract validation**: Do interfaces match expectations? - *Verify data formats, response structures, communication protocols*
- **Error propagation**: How do failures cascade? - *Test network timeouts, service unavailability, error response handling*
- **Data integrity**: Does data transform correctly across boundaries? - *Ensure no corruption, loss, or malformation during transfer*
- **Failure modes**: What happens when external systems fail? - *Test circuit breakers, retries, graceful degradation*
- **Backwards compatibility**: Do changes break existing consumers? - *Validate API evolution doesn't break dependent systems*

### Contract Testing Implementation

**Consumer-Driven Contracts:** Consumer defines expectations → Provider validates against contract → Both test independently in CI/CD

**Template:**
```
API Contract: UserService.createUser()
Consumer: POST /users → 201 + {id, email, created_at}
Provider Test: Validates response format matches contract
Consumer Test: Can parse and use response correctly
```

### Broad Integration Criteria

**Only when:**
- Critical business workflows (payments, user registration, core revenue)
- Complex transactions spanning multiple services that narrow tests can't validate
- Regulatory/compliance requirements
- Smoke tests for deployment verification

### Test Generation Template

**(Given/When/Then):**
- **Given**: Setup integration state/dependencies with known test data
- **When**: Execute the integration (API call, database operation, message send)
- **Then**: Assert the integration outcome and any side effects

**AAA Pattern (Arrange/Act/Assert):**
- **Arrange**: Set up test data, dependencies, and external system state
- **Act**: Execute the integration operation under test
- **Assert**: Verify the integration outcome and any side effects

**Naming:** "Should [integration behavior] when [scenario]" - Focus on integration aspect, not business logic

## 2025 Syntax Patterns (React Testing Library)

**Modern testing syntax improves readability while maintaining all core integration testing principles.**

### Query Pattern

```typescript
// ✅ PREFERRED: Use screen for consistency
renderWithProviders(<Component />);
await waitFor(() => {
  expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
});

// ⚠️ ALTERNATIVE: Destructuring (still valid)
const { getByTestId } = renderWithProviders(<Component />);
expect(getByTestId('recipe-detail-view-mode')).toBeTruthy();
```

**Why `screen`?**
- Consistent pattern across integration and unit tests
- Clearer test intent
- Matches official RTL recommendations (2023+)

### Assertion Pattern for Integration Points

```typescript
// ✅ PREFERRED: Semantic assertions that describe integration success
await waitFor(() => {
  expect(apiWasCalled).toBe(true);                              // Integration point: API called
  expect(screen.getByTestId('view-mode')).toBeVisible();        // Integration point: Component transitioned
  expect(mockNavigation.navigate).toHaveBeenCalledWith(...);    // Integration point: Navigation triggered
});

// ⚠️ ALTERNATIVE: Generic assertions (still valid)
expect(getByTestId('view-mode')).toBeTruthy();
```

**Why semantic assertions?**
- Clearer integration point verification
- Better error messages when integration fails
- Self-documenting test intent

### Integration Test Example: Old vs New

```typescript
// OLD SYNTAX (2024) - Still works
it('Should integrate API with component', async () => {
  let apiCalled = false;
  server.use(http.get('*/api/Recipe/:id', () => {
    apiCalled = true;
    return HttpResponse.json(mockData);
  }));

  const { getByTestId } = renderWithProviders(<RecipeDetailScreen route={route} />);

  await waitFor(() => {
    expect(apiCalled).toBe(true);
    expect(getByTestId('recipe-detail-view-mode')).toBeTruthy();
  });
});

// NEW SYNTAX (2025) - Preferred
it('Should integrate API with component', async () => {
  let apiCalled = false;
  server.use(http.get('*/api/Recipe/:id', () => {
    apiCalled = true;
    return HttpResponse.json(mockData);
  }));

  renderWithProviders(<RecipeDetailScreen route={route} />);

  await waitFor(() => {
    expect(apiCalled).toBe(true); // Integration point: API communication
    expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible(); // Integration point: Mode transition
  });
});
```

### Key Takeaway

**Strategy stays the same, syntax modernizes:**
- ✅ Still use MSW for API integration testing
- ✅ Still follow 80-90% Narrow, 10-20% Broad distribution
- ✅ Still focus on integration points, not business logic
- ✅ Still test error propagation and contract validation
- ✅ Just use more readable, semantic syntax