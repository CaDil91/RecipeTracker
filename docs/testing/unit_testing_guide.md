# Unit Testing Quick Reference Guideline

## Core Principles:

### "Test behavior, not implementation"

### Is This a Unit Test? (Fowler's Decision Criteria)

**✅ Unit Test If:**
- **Fast execution** (runs in milliseconds, not seconds)
- **No external dependencies** that slow it down or make it unreliable
- **Tests single unit of behavior** (one class or small cluster of related classes)
- **Independent** (can run in any order, no shared state)
- **Deterministic** (same input always produces same result)
- **Easy to understand** what failed when it breaks

**⚠️ Consider Integration Test If:**
- **Database required** (even in-memory databases often belong in integration tests)
- **Network calls** (APIs, web services, message queues)
- **File system operations** (unless very fast and isolated)
- **Multiple services/modules** need to work together
- **Configuration dependencies** (environment variables, config files)
- **Time-dependent** behavior (current date/time affects outcome)

**Fowler's Key Question:** *"Is this test fast, reliable, and focused on a single unit of behavior?"*

**Two Valid Approaches:**
- **Sociable**: Uses real collaborators within same module/service
- **Solitary**: Mocks external dependencies

**Fowler's Boundary Rule:** If using real dependencies makes the test **slow** (>100ms) or **unreliable** → It's probably an integration test

### What NOT to Test
Simple getters/setters, constants, private methods directly, framework code, trivial pass-through logic

**Quality over quantity**: Write as many tests as needed for confidence, no more, no less.

**Fowler's Quote**: *"Good tests give you confidence to change code. If your tests do that efficiently, you're on the right track."*

**Focus**: High-risk, complex business logic first. Simple code can often go untested.

**Speed**: Unit tests should be fast relative to integration tests. Exact timing matters less than maintaining the feedback loop.

## Test Strategy

### For any unit, ask:
- **Risk-Based Priority:** Test high-risk, high-value code first: complex business logic, frequently changing code, previously buggy code, critical workflows
- **Happy path**: Main scenario works? - *Test the primary use case that delivers business value*
- **Null/Empty/Invalid**: What happens with bad input? - *Verify graceful handling of edge cases and malformed data*
- **Boundaries**: What happens at limits? - *Test minimum, maximum, and threshold values for your domain*
- **Business Rules**: Domain rules enforced? - *Ensure critical business logic and constraints are validated*
- **Errors**: Exceptions handled correctly? - *Verify appropriate error responses and cleanup behavior*

### When to Mock (Fowler's Guidance)

**✅ Mock These:**
- **External systems** (databases, APIs, file systems)
- **Slow dependencies** (anything that makes test slow)
- **Non-deterministic dependencies** (random, time, network)
- **Dependencies you don't control** (third-party services)

**❌ Don't Mock These:**
- **Value objects** (simple data structures)
- **Dependencies within your unit** (same service/module)
- **Simple collaborators** that don't slow things down

**Rule:** Mock roles/interfaces, not specific objects. If real dependencies make tests slow or brittle → Mock them.

### Test Name Generation Template

**Given a function/method:**

1. **(Given/When/Then):**
   - **Given**: Setup/initial state
   - **When**: Execute the behavior
   - **Then**: Assert the expected outcome

**AAA Pattern (Arrange/Act/Assert):**
- **Arrange**: Set up test data and dependencies
- **Act**: Execute the function/method under test
- **Assert**: Verify the expected outcome

## 2025 Syntax Patterns (React Testing Library)

**Modern testing syntax improves readability and test realism while maintaining all core testing principles.**

### Query Pattern

```typescript
// ✅ PREFERRED: Use screen for consistency
render(<Component />);
expect(screen.getByText('Title')).toBeVisible();
expect(screen.getByTestId('button')).toBeOnTheScreen();

// ⚠️ ALTERNATIVE: Destructuring (still valid, but less consistent)
const { getByText, getByTestId } = render(<Component />);
expect(getByText('Title')).toBeTruthy();
```

**Why `screen`?**
- Consistent pattern across all tests
- No variable name conflicts
- Clearer when reading test code
- Matches official RTL recommendations (2023+)

### Assertion Pattern

```typescript
// ✅ PREFERRED: Semantic assertions (describe what you're testing)
expect(screen.getByTestId('button')).toBeVisible();       // Element is visible to user
expect(screen.getByText('Error')).toBeOnTheScreen();      // Element is rendered
expect(screen.getByRole('button')).toBeEnabled();         // Element is interactive
expect(screen.queryByText('Gone')).not.toBeOnTheScreen(); // Element not present

// ⚠️ ALTERNATIVE: Generic assertions (still valid)
expect(getByTestId('button')).toBeTruthy();
expect(queryByText('Gone')).toBeNull();
```

**Why semantic assertions?**
- Self-documenting (clear intent)
- Better error messages when tests fail
- Matches user perspective

**Note:** For property assertions, use `.toBeTruthy()`:
```typescript
expect(button.props.accessibilityLabel).toBeTruthy(); // ✅ Correct
expect(button.props.accessibilityLabel).toBeVisible(); // ❌ Wrong (properties aren't "visible")
```

### User Interaction Pattern

```typescript
// ✅ PREFERRED: userEvent for realistic interactions
const { user } = renderWithProviders(<Component />);
await user.type(input, 'Hello');
await user.press(button);

// ⚠️ ALTERNATIVE: fireEvent (still valid for simple cases)
fireEvent.changeText(input, 'Hello');
fireEvent.press(button);
```

**Why `userEvent`?**
- More realistic user interactions
- Automatically handles event sequences
- Better represents actual user behavior
- Async by default (matches real interactions)

**When to use `fireEvent`:**
- Simple, synchronous interactions
- Testing low-level event handling
- Performance-critical test suites

### Complete Example: Old vs New

```typescript
// OLD SYNTAX (2024) - Still works, but less modern
const { getByTestId, getByText } = renderWithProviders(<RecipeDetailScreen />);
const titleInput = getByTestId('recipe-form-title');
fireEvent.changeText(titleInput, 'Pasta');
fireEvent.press(getByTestId('submit-button'));
expect(getByText('Success')).toBeTruthy();

// NEW SYNTAX (2025) - Preferred modern approach
const { user } = renderWithProviders(<RecipeDetailScreen />);
const titleInput = screen.getByTestId('recipe-form-title');
await user.type(titleInput, 'Pasta');
await user.press(screen.getByTestId('submit-button'));
expect(screen.getByText('Success')).toBeVisible();
```

### Key Takeaway

**Strategy stays the same, syntax modernizes:**
- ✅ Still test business logic and behavior
- ✅ Still use sociable tests with real dependencies where appropriate
- ✅ Still mock only external boundaries
- ✅ Still organize by risk-based priority
- ✅ Just use more readable, semantic syntax