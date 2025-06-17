"""
SOLID Principles in Python - Single Responsibility Principle (SRP)

The Single Responsibility Principle is the first principle of SOLID.
It states that a class should have only ONE reason to change.

Definition: A class should have only one job or responsibility.

Why it matters:
- Makes code more maintainable and easier to understand
- Reduces coupling between different functionalities
- Makes testing easier (smaller, focused units)
- Prevents the "God Object" anti-pattern
- Facilitates code reuse

When to apply:
- When a class is doing too many different things
- When changes to one feature require modifying the same class as unrelated features
- When a class has multiple reasons to change
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime
import json


# ============================================================================
# BAD EXAMPLE - Violating Single Responsibility Principle
# ============================================================================

class UserManager:
    """
    BAD EXAMPLE: This class violates SRP because it has multiple responsibilities:
    1. User data management
    2. User validation
    3. Email sending
    4. Database operations
    5. Logging
    
    This means the class has MULTIPLE reasons to change:
    - If validation rules change
    - If email service changes
    - If database structure changes
    - If logging format changes
    - If user data structure changes
    """
    
    def __init__(self):
        self.users: List[Dict] = []
    
    def create_user(self, username: str, email: str, password: str) -> bool:
        # Responsibility 1: Data validation
        if not username or len(username) < 3:
            print("Username must be at least 3 characters")
            return False
        
        if "@" not in email or "." not in email:
            print("Invalid email format")
            return False
        
        if len(password) < 8:
            print("Password must be at least 8 characters")
            return False
        
        # Responsibility 2: User data management
        user_data = {
            "id": len(self.users) + 1,
            "username": username,
            "email": email,
            "password": password,  # In real app, this should be hashed!
            "created_at": datetime.now().isoformat()
        }
        
        # Responsibility 3: Database operations
        self.users.append(user_data)
        
        # Responsibility 4: Email sending
        print(f"Sending welcome email to {email}")
        print(f"Subject: Welcome {username}!")
        print("Email sent successfully")
        
        # Responsibility 5: Logging
        print(f"[LOG] User {username} created at {datetime.now()}")
        
        return True
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        # Database operation mixed with business logic
        for user in self.users:
            if user["id"] == user_id:
                return user
        return None
    
    def update_user_email(self, user_id: int, new_email: str) -> bool:
        # Validation logic mixed with data operations
        if "@" not in new_email or "." not in new_email:
            print("Invalid email format")
            return False
        
        user = self.get_user(user_id)
        if user:
            old_email = user["email"]
            user["email"] = new_email
            
            # Email notification mixed with data operations
            print(f"Sending email change notification to {old_email}")
            print(f"Your email has been changed to {new_email}")
            
            # Logging mixed with business logic
            print(f"[LOG] User {user_id} email changed from {old_email} to {new_email}")
            return True
        return False


# ============================================================================
# GOOD EXAMPLE - Following Single Responsibility Principle
# ============================================================================

class User:
    """
    GOOD: This class has only ONE responsibility - representing user data.
    It's a simple data container with basic user information.
    """
    
    def __init__(self, user_id: int, username: str, email: str, password: str):
        self.id = user_id
        self.username = username
        self.email = email
        self.password = password  # In real app, this should be hashed!
        self.created_at = datetime.now()
    
    def to_dict(self) -> Dict:
        """Convert user object to dictionary representation."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "created_at": self.created_at.isoformat()
        }
    
    def __str__(self) -> str:
        return f"User(id={self.id}, username={self.username}, email={self.email})"


class UserValidator:
    """
    GOOD: This class has only ONE responsibility - validating user data.
    All validation logic is centralized here.
    """
    
    @staticmethod
    def validate_username(username: str) -> tuple[bool, str]:
        """Validate username and return (is_valid, error_message)."""
        if not username:
            return False, "Username is required"
        if len(username) < 3:
            return False, "Username must be at least 3 characters"
        if len(username) > 20:
            return False, "Username must be less than 20 characters"
        return True, ""
    
    @staticmethod
    def validate_email(email: str) -> tuple[bool, str]:
        """Validate email and return (is_valid, error_message)."""
        if not email:
            return False, "Email is required"
        if "@" not in email or "." not in email:
            return False, "Invalid email format"
        if len(email) > 100:
            return False, "Email is too long"
        return True, ""
    
    @staticmethod
    def validate_password(password: str) -> tuple[bool, str]:
        """Validate password and return (is_valid, error_message)."""
        if not password:
            return False, "Password is required"
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        if len(password) > 50:
            return False, "Password is too long"
        return True, ""
    
    def validate_user_data(self, username: str, email: str, password: str) -> tuple[bool, List[str]]:
        """Validate all user data and return (is_valid, list_of_errors)."""
        errors = []
        
        is_valid, error = self.validate_username(username)
        if not is_valid:
            errors.append(error)
        
        is_valid, error = self.validate_email(email)
        if not is_valid:
            errors.append(error)
        
        is_valid, error = self.validate_password(password)
        if not is_valid:
            errors.append(error)
        
        return len(errors) == 0, errors


class EmailService:
    """
    GOOD: This class has only ONE responsibility - sending emails.
    All email-related functionality is here.
    """
    
    def send_welcome_email(self, user: User) -> bool:
        """Send welcome email to new user."""
        print(f"📧 Sending welcome email to {user.email}")
        print(f"Subject: Welcome {user.username}!")
        print("Welcome to our platform! We're excited to have you.")
        print("✅ Welcome email sent successfully")
        return True
    
    def send_email_change_notification(self, old_email: str, new_email: str) -> bool:
        """Send notification about email change."""
        print(f"📧 Sending email change notification to {old_email}")
        print(f"Subject: Email Address Changed")
        print(f"Your email has been changed to {new_email}")
        print("✅ Email change notification sent successfully")
        return True
    
    def send_password_reset_email(self, user: User) -> bool:
        """Send password reset email."""
        print(f"📧 Sending password reset email to {user.email}")
        print(f"Subject: Password Reset Request")
        print("Click the link to reset your password.")
        print("✅ Password reset email sent successfully")
        return True


class UserRepository:
    """
    GOOD: This class has only ONE responsibility - data persistence.
    All database/storage operations are here.
    """
    
    def __init__(self):
        self._users: List[User] = []
        self._next_id = 1
    
    def create_user(self, username: str, email: str, password: str) -> User:
        """Create and save a new user."""
        user = User(self._next_id, username, email, password)
        self._users.append(user)
        self._next_id += 1
        return user
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        for user in self._users:
            if user.id == user_id:
                return user
        return None
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        for user in self._users:
            if user.username == username:
                return user
        return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        for user in self._users:
            if user.email == email:
                return user
        return None
    
    def update_user(self, user: User) -> bool:
        """Update existing user."""
        existing_user = self.get_user_by_id(user.id)
        if existing_user:
            # Update the existing user's data
            existing_user.username = user.username
            existing_user.email = user.email
            existing_user.password = user.password
            return True
        return False
    
    def delete_user(self, user_id: int) -> bool:
        """Delete user by ID."""
        for i, user in enumerate(self._users):
            if user.id == user_id:
                del self._users[i]
                return True
        return False
    
    def get_all_users(self) -> List[User]:
        """Get all users."""
        return self._users.copy()


class Logger:
    """
    GOOD: This class has only ONE responsibility - logging.
    All logging functionality is centralized here.
    """
    
    def log_user_created(self, user: User) -> None:
        """Log user creation event."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[LOG {timestamp}] User created: {user.username} (ID: {user.id})")
    
    def log_user_updated(self, user: User, field: str, old_value: str, new_value: str) -> None:
        """Log user update event."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[LOG {timestamp}] User {user.username} (ID: {user.id}) - {field} changed from '{old_value}' to '{new_value}'")
    
    def log_user_deleted(self, user_id: int, username: str) -> None:
        """Log user deletion event."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[LOG {timestamp}] User deleted: {username} (ID: {user_id})")
    
    def log_error(self, operation: str, error: str) -> None:
        """Log error event."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[ERROR {timestamp}] {operation}: {error}")


class UserService:
    """
    GOOD: This class orchestrates the other services but has a single responsibility:
    coordinating user-related business operations.
    
    It delegates specific tasks to specialized classes.
    """
    
    def __init__(self, repository: UserRepository, validator: UserValidator, 
                 email_service: EmailService, logger: Logger):
        self.repository = repository
        self.validator = validator
        self.email_service = email_service
        self.logger = logger
    
    def create_user(self, username: str, email: str, password: str) -> tuple[bool, str, Optional[User]]:
        """Create a new user with full validation and notifications."""
        # Validate input data
        is_valid, errors = self.validator.validate_user_data(username, email, password)
        if not is_valid:
            error_message = "; ".join(errors)
            self.logger.log_error("User creation", error_message)
            return False, error_message, None
        
        # Check if user with same username or email already exists
        if self.repository.get_user_by_username(username):
            error_message = "Username already exists"
            self.logger.log_error("User creation", error_message)
            return False, error_message, None
        
        if self.repository.get_user_by_email(email):
            error_message = "Email already exists"
            self.logger.log_error("User creation", error_message)
            return False, error_message, None
        
        # Create user
        user = self.repository.create_user(username, email, password)
        
        # Send welcome email
        self.email_service.send_welcome_email(user)
        
        # Log the event
        self.logger.log_user_created(user)
        
        return True, "User created successfully", user
    
    def update_user_email(self, user_id: int, new_email: str) -> tuple[bool, str]:
        """Update user's email with validation and notifications."""
        # Validate new email
        is_valid, error = self.validator.validate_email(new_email)
        if not is_valid:
            self.logger.log_error("Email update", error)
            return False, error
        
        # Get existing user
        user = self.repository.get_user_by_id(user_id)
        if not user:
            error_message = "User not found"
            self.logger.log_error("Email update", error_message)
            return False, error_message
        
        # Check if new email is already used
        existing_user = self.repository.get_user_by_email(new_email)
        if existing_user and existing_user.id != user_id:
            error_message = "Email already exists"
            self.logger.log_error("Email update", error_message)
            return False, error_message
        
        # Update email
        old_email = user.email
        user.email = new_email
        self.repository.update_user(user)
        
        # Send notification
        self.email_service.send_email_change_notification(old_email, new_email)
        
        # Log the event
        self.logger.log_user_updated(user, "email", old_email, new_email)
        
        return True, "Email updated successfully"


# ============================================================================
# DEMONSTRATION CODE
# ============================================================================

def demonstrate_srp_violation():
    """Demonstrate the problems with violating SRP."""
    print("=" * 60)
    print("DEMONSTRATING SRP VIOLATION (BAD EXAMPLE)")
    print("=" * 60)
    
    # Using the bad UserManager class
    user_manager = UserManager()
    
    print("Creating users with the BAD UserManager class:")
    print("(Notice how one class handles validation, email, database, logging)")
    print()
    
    # This will work but the class is doing too many things
    user_manager.create_user("john_doe", "john@example.com", "password123")
    print()
    
    # Try invalid data
    user_manager.create_user("ab", "invalid-email", "123")
    print()
    
    # Update email
    user_manager.update_user_email(1, "newemail@example.com")
    print()
    
    print("PROBLEMS WITH THIS APPROACH:")
    print("1. The UserManager class has too many responsibilities")
    print("2. Hard to test individual components")
    print("3. Changes to email format affect user validation code")
    print("4. Changes to logging affect user creation code")
    print("5. Violates the Single Responsibility Principle")
    print()


def demonstrate_srp_compliance():
    """Demonstrate the benefits of following SRP."""
    print("=" * 60)
    print("DEMONSTRATING SRP COMPLIANCE (GOOD EXAMPLE)")
    print("=" * 60)
    
    # Create instances of specialized classes
    repository = UserRepository()
    validator = UserValidator()
    email_service = EmailService()
    logger = Logger()
    user_service = UserService(repository, validator, email_service, logger)
    
    print("Creating users with specialized classes:")
    print("(Notice how each class has a single, clear responsibility)")
    print()
    
    # Create valid user
    success, message, user = user_service.create_user("jane_doe", "jane@example.com", "securepass123")
    if success:
        print(f"✅ {message}")
        print(f"Created user: {user}")
    else:
        print(f"❌ {message}")
    print()
    
    # Try to create user with invalid data
    success, message, user = user_service.create_user("ab", "invalid-email", "123")
    if not success:
        print(f"❌ Validation failed: {message}")
    print()
    
    # Update email
    success, message = user_service.update_user_email(1, "jane.smith@example.com")
    if success:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")
    print()
    
    print("BENEFITS OF THIS APPROACH:")
    print("1. Each class has a single, clear responsibility")
    print("2. Easy to test individual components")
    print("3. Changes to email service don't affect validation")
    print("4. Changes to logging don't affect user creation")
    print("5. Code is more maintainable and reusable")
    print("6. Follows the Single Responsibility Principle")
    print()


def demonstrate_testing_benefits():
    """Show how SRP makes testing easier."""
    print("=" * 60)
    print("TESTING BENEFITS OF SRP")
    print("=" * 60)
    
    # Test individual components
    validator = UserValidator()
    
    print("Testing UserValidator in isolation:")
    
    # Test username validation
    is_valid, error = validator.validate_username("ab")
    print(f"Username 'ab': Valid={is_valid}, Error='{error}'")
    
    is_valid, error = validator.validate_username("john_doe")
    print(f"Username 'john_doe': Valid={is_valid}, Error='{error}'")
    
    # Test email validation
    is_valid, error = validator.validate_email("invalid-email")
    print(f"Email 'invalid-email': Valid={is_valid}, Error='{error}'")
    
    is_valid, error = validator.validate_email("valid@example.com")
    print(f"Email 'valid@example.com': Valid={is_valid}, Error='{error}'")
    
    print()
    print("Benefits for testing:")
    print("1. Can test validation logic without database operations")
    print("2. Can test email service without user creation")
    print("3. Can test repository without validation logic")
    print("4. Each test is focused and fast")
    
    # Test repository in isolation
    print("\nTesting UserRepository in isolation:")
    repository = UserRepository()
    user = repository.create_user("test_user", "test@example.com", "password123")
    print(f"Created user: {user}")
    
    found_user = repository.get_user_by_id(user.id)
    print(f"Found user by ID: {found_user}")
    
    found_user = repository.get_user_by_username("test_user")
    print(f"Found user by username: {found_user}")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("SOLID Principles in Python - Single Responsibility Principle")
    print("===========================================================")
    print()
    
    demonstrate_srp_violation()
    print()
    
    demonstrate_srp_compliance()
    print()
    
    demonstrate_testing_benefits()
    
    print("\n" + "=" * 60)
    print("KEY TAKEAWAYS:")
    print("=" * 60)
    print("1. A class should have only ONE reason to change")
    print("2. Separate concerns into different classes")
    print("3. Each class should have a single, well-defined responsibility")
    print("4. SRP makes code more maintainable, testable, and reusable")
    print("5. Use composition to combine single-purpose classes")
    print("6. Think about 'What would cause this class to change?'")
    print("   - If there are multiple answers, consider splitting the class")
