"""
SOLID Principles in Python - Dependency Inversion Principle (DIP)

The Dependency Inversion Principle is the fifth and final principle of SOLID.
It states that high-level modules should not depend on low-level modules.
Both should depend on abstractions.

Definition: 
1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
2. Abstractions should not depend on details. Details should depend on abstractions.

Simply put: Depend on interfaces, not concrete implementations.

Why it matters:
- Reduces coupling between modules
- Makes code more flexible and maintainable
- Enables easier testing through dependency injection
- Supports the Open/Closed Principle
- Makes systems more modular and extensible
- Facilitates code reuse and substitution

When to apply:
- When high-level business logic depends on low-level implementation details
- When you want to make code testable with mocks/stubs
- When building modular systems with interchangeable components
- When you need to support multiple implementations of the same service

How to achieve:
- Use abstract base classes or protocols to define interfaces
- Inject dependencies through constructors, setters, or parameters
- Use dependency injection containers for complex scenarios
- Apply inversion of control patterns
- Design from the interface down, not implementation up

Common violations:
- Direct instantiation of dependencies within classes
- Hardcoded references to specific implementations
- Tight coupling between business logic and infrastructure
- Difficulty in unit testing due to concrete dependencies
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Protocol
from enum import Enum
import json
from datetime import datetime


# ============================================================================
# BAD EXAMPLE 1 - Direct Database Dependency (DIP Violation)
# ============================================================================

class MySQLDatabase:
    """Low-level module - concrete database implementation."""
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.connected = False
    
    def connect(self) -> None:
        print(f"Connecting to MySQL database: {self.connection_string}")
        self.connected = True
    
    def disconnect(self) -> None:
        print("Disconnecting from MySQL database")
        self.connected = False
    
    def execute_query(self, query: str) -> List[Dict]:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"Executing MySQL query: {query}")
        # Simulate returning data
        return [{"id": 1, "name": "John", "email": "john@example.com"}]


class UserServiceBad:
    """
    BAD EXAMPLE: High-level module directly depends on low-level module.
    
    Problems:
    1. Tightly coupled to MySQL database - can't use other databases
    2. Hard to test - can't mock the database
    3. Violates DIP by depending on concrete implementation
    4. Changes to database require changes to service
    5. Cannot substitute different database implementations
    """
    
    def __init__(self):
        # VIOLATION: Creating concrete dependency directly!
        self.database = MySQLDatabase("mysql://localhost:3306/users")
        self.database.connect()
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        # VIOLATION: Business logic tightly coupled to MySQL implementation
        query = f"SELECT * FROM users WHERE id = {user_id}"
        results = self.database.execute_query(query)
        return results[0] if results else None
    
    def create_user(self, name: str, email: str) -> Dict:
        # VIOLATION: SQL syntax hardcoded in business logic
        query = f"INSERT INTO users (name, email) VALUES ('{name}', '{email}')"
        self.database.execute_query(query)
        return {"id": 123, "name": name, "email": email}


# ============================================================================
# BAD EXAMPLE 2 - Direct Logger Dependency (DIP Violation)
# ============================================================================

class FileLogger:
    """Low-level module - concrete logging implementation."""
    
    def __init__(self, filename: str):
        self.filename = filename
    
    def log(self, message: str) -> None:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.filename, "a") as f:
            f.write(f"[{timestamp}] {message}\n")
        print(f"Logged to file {self.filename}: {message}")


class OrderProcessorBad:
    """
    BAD EXAMPLE: High-level business logic depends on concrete logger.
    
    Problems:
    1. Cannot switch to different logging implementations
    2. Hard to test without creating actual files
    3. Violates DIP by depending on FileLogger concrete class
    4. Business logic mixed with logging implementation details
    """
    
    def __init__(self):
        # VIOLATION: Creating concrete dependency directly!
        self.logger = FileLogger("orders.log")
    
    def process_order(self, order_id: str, amount: float) -> bool:
        try:
            # Business logic
            print(f"Processing order {order_id} for ${amount}")
            
            # VIOLATION: Directly using concrete logger
            self.logger.log(f"Processing order {order_id}")
            
            # Simulate order processing
            if amount > 0:
                self.logger.log(f"Order {order_id} processed successfully")
                return True
            else:
                self.logger.log(f"Order {order_id} failed: Invalid amount")
                return False
                
        except Exception as e:
            self.logger.log(f"Order {order_id} failed: {str(e)}")
            return False


# ============================================================================
# BAD EXAMPLE 3 - Direct Email Service Dependency (DIP Violation)
# ============================================================================

class SMTPEmailService:
    """Low-level module - concrete email implementation."""
    
    def __init__(self, smtp_server: str, port: int):
        self.smtp_server = smtp_server
        self.port = port
    
    def send_email(self, to: str, subject: str, body: str) -> bool:
        print(f"Sending email via SMTP {self.smtp_server}:{self.port}")
        print(f"To: {to}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        return True


class NotificationServiceBad:
    """
    BAD EXAMPLE: Notification service depends on concrete email implementation.
    
    Problems:
    1. Cannot switch to different notification methods (SMS, push, etc.)
    2. Hard to test without actually sending emails
    3. Violates DIP by depending on concrete SMTP implementation
    4. Cannot support multiple notification channels
    """
    
    def __init__(self):
        # VIOLATION: Creating concrete dependency directly!
        self.email_service = SMTPEmailService("smtp.gmail.com", 587)
    
    def send_welcome_notification(self, user_email: str, username: str) -> bool:
        subject = "Welcome!"
        body = f"Welcome {username} to our platform!"
        
        # VIOLATION: Directly using concrete email service
        return self.email_service.send_email(user_email, subject, body)
    
    def send_order_confirmation(self, user_email: str, order_id: str) -> bool:
        subject = "Order Confirmation"
        body = f"Your order {order_id} has been confirmed."
        
        # VIOLATION: Limited to email notifications only
        return self.email_service.send_email(user_email, subject, body)


# ============================================================================
# GOOD EXAMPLE 1 - Database Abstraction (Following DIP)
# ============================================================================

class DatabaseInterface(ABC):
    """
    GOOD: Abstract interface for database operations.
    High-level modules depend on this abstraction, not concrete implementations.
    """
    
    @abstractmethod
    def connect(self) -> None:
        """Connect to the database."""
        pass
    
    @abstractmethod
    def disconnect(self) -> None:
        """Disconnect from the database."""
        pass
    
    @abstractmethod
    def find_user(self, user_id: int) -> Optional[Dict]:
        """Find user by ID."""
        pass
    
    @abstractmethod
    def create_user(self, name: str, email: str) -> Dict:
        """Create a new user."""
        pass
    
    @abstractmethod
    def update_user(self, user_id: int, data: Dict) -> bool:
        """Update user information."""
        pass
    
    @abstractmethod
    def delete_user(self, user_id: int) -> bool:
        """Delete user by ID."""
        pass


class MySQLDatabaseAdapter(DatabaseInterface):
    """
    GOOD: Concrete implementation of database interface.
    Details depend on abstraction, not the other way around.
    """
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.connected = False
    
    def connect(self) -> None:
        print(f"Connecting to MySQL: {self.connection_string}")
        self.connected = True
    
    def disconnect(self) -> None:
        print("Disconnecting from MySQL")
        self.connected = False
    
    def find_user(self, user_id: int) -> Optional[Dict]:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"MySQL: Finding user {user_id}")
        # Simulate database query
        return {"id": user_id, "name": "John Doe", "email": "john@example.com"}
    
    def create_user(self, name: str, email: str) -> Dict:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"MySQL: Creating user {name} ({email})")
        # Simulate user creation
        return {"id": 123, "name": name, "email": email}
    
    def update_user(self, user_id: int, data: Dict) -> bool:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"MySQL: Updating user {user_id} with {data}")
        return True
    
    def delete_user(self, user_id: int) -> bool:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"MySQL: Deleting user {user_id}")
        return True


class PostgreSQLDatabaseAdapter(DatabaseInterface):
    """
    GOOD: Alternative implementation of database interface.
    Can be substituted without changing high-level modules.
    """
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.connected = False
    
    def connect(self) -> None:
        print(f"Connecting to PostgreSQL: {self.connection_string}")
        self.connected = True
    
    def disconnect(self) -> None:
        print("Disconnecting from PostgreSQL")
        self.connected = False
    
    def find_user(self, user_id: int) -> Optional[Dict]:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"PostgreSQL: Finding user {user_id}")
        return {"id": user_id, "name": "Jane Smith", "email": "jane@example.com"}
    
    def create_user(self, name: str, email: str) -> Dict:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"PostgreSQL: Creating user {name} ({email})")
        return {"id": 456, "name": name, "email": email}
    
    def update_user(self, user_id: int, data: Dict) -> bool:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"PostgreSQL: Updating user {user_id} with {data}")
        return True
    
    def delete_user(self, user_id: int) -> bool:
        if not self.connected:
            raise Exception("Database not connected")
        print(f"PostgreSQL: Deleting user {user_id}")
        return True


class InMemoryDatabaseAdapter(DatabaseInterface):
    """
    GOOD: In-memory implementation for testing.
    Perfect for unit tests without external dependencies.
    """
    
    def __init__(self):
        self.users: Dict[int, Dict] = {}
        self.connected = False
        self.next_id = 1
    
    def connect(self) -> None:
        print("Connecting to in-memory database")
        self.connected = True
    
    def disconnect(self) -> None:
        print("Disconnecting from in-memory database")
        self.connected = False
    
    def find_user(self, user_id: int) -> Optional[Dict]:
        if not self.connected:
            raise Exception("Database not connected")
        return self.users.get(user_id)
    
    def create_user(self, name: str, email: str) -> Dict:
        if not self.connected:
            raise Exception("Database not connected")
        user = {"id": self.next_id, "name": name, "email": email}
        self.users[self.next_id] = user
        self.next_id += 1
        print(f"In-memory: Created user {name}")
        return user
    
    def update_user(self, user_id: int, data: Dict) -> bool:
        if not self.connected:
            raise Exception("Database not connected")
        if user_id in self.users:
            self.users[user_id].update(data)
            print(f"In-memory: Updated user {user_id}")
            return True
        return False
    
    def delete_user(self, user_id: int) -> bool:
        if not self.connected:
            raise Exception("Database not connected")
        if user_id in self.users:
            del self.users[user_id]
            print(f"In-memory: Deleted user {user_id}")
            return True
        return False


class UserService:
    """
    GOOD: High-level module depends on abstraction (DatabaseInterface).
    Can work with any database implementation without modification.
    """
    
    def __init__(self, database: DatabaseInterface):
        # GOOD: Dependency injected through constructor
        self.database = database
        self.database.connect()
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        """Get user by ID - works with any database implementation."""
        return self.database.find_user(user_id)
    
    def create_user(self, name: str, email: str) -> Dict:
        """Create new user - database-agnostic business logic."""
        if not name or not email:
            raise ValueError("Name and email are required")
        
        return self.database.create_user(name, email)
    
    def update_user_email(self, user_id: int, new_email: str) -> bool:
        """Update user email - works with any database."""
        if not new_email or "@" not in new_email:
            raise ValueError("Valid email is required")
        
        return self.database.update_user(user_id, {"email": new_email})
    
    def delete_user(self, user_id: int) -> bool:
        """Delete user - database implementation independent."""
        return self.database.delete_user(user_id)
    
    def cleanup(self) -> None:
        """Clean up resources."""
        self.database.disconnect()


# ============================================================================
# GOOD EXAMPLE 2 - Logger Abstraction (Following DIP)
# ============================================================================

class LoggerInterface(Protocol):
    """
    GOOD: Abstract interface for logging operations.
    Using Protocol for structural typing - more Pythonic.
    """
    
    def log(self, message: str, level: str = "INFO") -> None:
        """Log a message with specified level."""
        ...


class FileLoggerAdapter:
    """GOOD: File-based logging implementation."""
    
    def __init__(self, filename: str):
        self.filename = filename
    
    def log(self, message: str, level: str = "INFO") -> None:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] [{level}] {message}\n"
        
        with open(self.filename, "a") as f:
            f.write(log_entry)
        print(f"File logger: {log_entry.strip()}")


class ConsoleLoggerAdapter:
    """GOOD: Console-based logging implementation."""
    
    def __init__(self, include_timestamp: bool = True):
        self.include_timestamp = include_timestamp
    
    def log(self, message: str, level: str = "INFO") -> None:
        if self.include_timestamp:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_entry = f"[{timestamp}] [{level}] {message}"
        else:
            log_entry = f"[{level}] {message}"
        
        print(f"Console logger: {log_entry}")


class DatabaseLoggerAdapter:
    """GOOD: Database-based logging implementation."""
    
    def __init__(self, table_name: str = "logs"):
        self.table_name = table_name
    
    def log(self, message: str, level: str = "INFO") -> None:
        timestamp = datetime.now().isoformat()
        print(f"Database logger: INSERT INTO {self.table_name} (timestamp, level, message) "
              f"VALUES ('{timestamp}', '{level}', '{message}')")


class CompositeLogger:
    """GOOD: Logger that can send logs to multiple destinations."""
    
    def __init__(self, loggers: List[LoggerInterface]):
        self.loggers = loggers
    
    def log(self, message: str, level: str = "INFO") -> None:
        for logger in self.loggers:
            logger.log(message, level)


class OrderProcessor:
    """
    GOOD: High-level module depends on logger abstraction.
    Can work with any logging implementation.
    """
    
    def __init__(self, logger: LoggerInterface):
        # GOOD: Dependency injected through constructor
        self.logger = logger
    
    def process_order(self, order_id: str, amount: float) -> bool:
        try:
            self.logger.log(f"Processing order {order_id} for ${amount}")
            
            # Business logic
            if amount <= 0:
                self.logger.log(f"Order {order_id} failed: Invalid amount", "ERROR")
                return False
            
            # Simulate processing
            print(f"Processing order {order_id} for ${amount}")
            
            self.logger.log(f"Order {order_id} processed successfully")
            return True
            
        except Exception as e:
            self.logger.log(f"Order {order_id} failed: {str(e)}", "ERROR")
            return False


# ============================================================================
# GOOD EXAMPLE 3 - Notification Abstraction (Following DIP)
# ============================================================================

class NotificationInterface(ABC):
    """
    GOOD: Abstract interface for notification services.
    Allows multiple notification methods.
    """
    
    @abstractmethod
    def send_notification(self, recipient: str, subject: str, message: str) -> bool:
        """Send notification to recipient."""
        pass
    
    @abstractmethod
    def get_notification_type(self) -> str:
        """Get the type of notification service."""
        pass


class EmailNotificationAdapter(NotificationInterface):
    """GOOD: Email-based notification implementation."""
    
    def __init__(self, smtp_server: str, port: int):
        self.smtp_server = smtp_server
        self.port = port
    
    def send_notification(self, recipient: str, subject: str, message: str) -> bool:
        print(f"📧 Sending email via {self.smtp_server}:{self.port}")
        print(f"   To: {recipient}")
        print(f"   Subject: {subject}")
        print(f"   Message: {message}")
        return True
    
    def get_notification_type(self) -> str:
        return "Email"


class SMSNotificationAdapter(NotificationInterface):
    """GOOD: SMS-based notification implementation."""
    
    def __init__(self, api_key: str, service_provider: str):
        self.api_key = api_key
        self.service_provider = service_provider
    
    def send_notification(self, recipient: str, subject: str, message: str) -> bool:
        print(f"📱 Sending SMS via {self.service_provider}")
        print(f"   To: {recipient}")
        print(f"   Message: {subject} - {message}")
        return True
    
    def get_notification_type(self) -> str:
        return "SMS"


class PushNotificationAdapter(NotificationInterface):
    """GOOD: Push notification implementation."""
    
    def __init__(self, app_id: str, api_key: str):
        self.app_id = app_id
        self.api_key = api_key
    
    def send_notification(self, recipient: str, subject: str, message: str) -> bool:
        print(f"🔔 Sending push notification (App: {self.app_id})")
        print(f"   To: {recipient}")
        print(f"   Title: {subject}")
        print(f"   Message: {message}")
        return True
    
    def get_notification_type(self) -> str:
        return "Push"


class MultiChannelNotificationService:
    """
    GOOD: Service that can send notifications through multiple channels.
    Depends on NotificationInterface abstraction.
    """
    
    def __init__(self, notification_services: List[NotificationInterface]):
        # GOOD: Multiple dependencies injected
        self.notification_services = notification_services
    
    def send_welcome_notification(self, recipient: str, username: str) -> bool:
        subject = "Welcome!"
        message = f"Welcome {username} to our platform!"
        
        success = True
        for service in self.notification_services:
            try:
                result = service.send_notification(recipient, subject, message)
                if not result:
                    success = False
                    print(f"❌ Failed to send via {service.get_notification_type()}")
            except Exception as e:
                success = False
                print(f"❌ Error sending via {service.get_notification_type()}: {e}")
        
        return success
    
    def send_order_confirmation(self, recipient: str, order_id: str) -> bool:
        subject = "Order Confirmation"
        message = f"Your order {order_id} has been confirmed and is being processed."
        
        # Send via all available notification methods
        for service in self.notification_services:
            service.send_notification(recipient, subject, message)
        
        return True
    
    def add_notification_service(self, service: NotificationInterface) -> None:
        """Add a new notification service at runtime."""
        self.notification_services.append(service)
    
    def get_available_notification_types(self) -> List[str]:
        """Get list of available notification types."""
        return [service.get_notification_type() for service in self.notification_services]


# ============================================================================
# ADVANCED EXAMPLE - Dependency Injection Container
# ============================================================================

class DIContainer:
    """
    Simple Dependency Injection Container for managing dependencies.
    In real applications, you might use libraries like dependency-injector.
    """
    
    def __init__(self):
        self._services: Dict[str, any] = {}
        self._factories: Dict[str, callable] = {}
    
    def register_instance(self, name: str, instance: any) -> None:
        """Register a singleton instance."""
        self._services[name] = instance
    
    def register_factory(self, name: str, factory: callable) -> None:
        """Register a factory function for creating instances."""
        self._factories[name] = factory
    
    def get(self, name: str) -> any:
        """Get service instance by name."""
        # Return singleton if exists
        if name in self._services:
            return self._services[name]
        
        # Create using factory if available
        if name in self._factories:
            instance = self._factories[name]()
            return instance
        
        raise ValueError(f"Service '{name}' not found")


class PaymentInterface(ABC):
    """Interface for payment processing."""
    
    @abstractmethod
    def process_payment(self, amount: float, payment_method: str) -> bool:
        """Process payment and return success status."""
        pass


class CreditCardPaymentProcessor(PaymentInterface):
    """Credit card payment implementation."""
    
    def process_payment(self, amount: float, payment_method: str) -> bool:
        print(f"💳 Processing ${amount} credit card payment")
        return amount > 0


class PayPalPaymentProcessor(PaymentInterface):
    """PayPal payment implementation."""
    
    def process_payment(self, amount: float, payment_method: str) -> bool:
        print(f"🅿️ Processing ${amount} PayPal payment")
        return amount > 0


class ECommerceService:
    """
    High-level e-commerce service that depends on multiple abstractions.
    All dependencies are injected, following DIP.
    """
    
    def __init__(self, database: DatabaseInterface, logger: LoggerInterface, 
                 notification: NotificationInterface, payment: PaymentInterface):
        self.database = database
        self.logger = logger
        self.notification = notification
        self.payment = payment
    
    def create_user_account(self, name: str, email: str) -> Dict:
        """Create user account using injected dependencies."""
        try:
            self.logger.log(f"Creating account for {name} ({email})")
            
            user = self.database.create_user(name, email)
            
            self.notification.send_notification(
                email, 
                "Welcome!", 
                f"Welcome {name}! Your account has been created."
            )
            
            self.logger.log(f"Account created successfully for {name}")
            return user
            
        except Exception as e:
            self.logger.log(f"Failed to create account for {name}: {e}", "ERROR")
            raise
    
    def process_order(self, user_id: int, amount: float, payment_method: str) -> bool:
        """Process order using all injected services."""
        try:
            self.logger.log(f"Processing order for user {user_id}, amount ${amount}")
            
            # Get user info
            user = self.database.find_user(user_id)
            if not user:
                raise ValueError("User not found")
            
            # Process payment
            if not self.payment.process_payment(amount, payment_method):
                raise ValueError("Payment failed")
            
            # Send confirmation
            self.notification.send_notification(
                user["email"],
                "Order Confirmation",
                f"Your order for ${amount} has been processed successfully."
            )
            
            self.logger.log(f"Order processed successfully for user {user_id}")
            return True
            
        except Exception as e:
            self.logger.log(f"Order processing failed: {e}", "ERROR")
            return False


# ============================================================================
# DEMONSTRATION CODE
# ============================================================================

def demonstrate_dip_violation():
    """Demonstrate the problems with violating DIP."""
    print("=" * 60)
    print("DEMONSTRATING DIP VIOLATION (BAD EXAMPLES)")
    print("=" * 60)
    
    print("1. DIRECT DATABASE DEPENDENCY:")
    print("-" * 30)
    
    # Bad: Service creates its own database dependency
    user_service_bad = UserServiceBad()
    user = user_service_bad.get_user(1)
    print(f"Retrieved user: {user}")
    print("❌ Problems: Tightly coupled to MySQL, hard to test, inflexible")
    print()
    
    print("2. DIRECT LOGGER DEPENDENCY:")
    print("-" * 30)
    
    # Bad: Processor creates its own logger dependency
    processor_bad = OrderProcessorBad()
    result = processor_bad.process_order("ORD-123", 99.99)
    print(f"Order processing result: {result}")
    print("❌ Problems: Tied to file logging, hard to test, inflexible")
    print()
    
    print("3. DIRECT EMAIL SERVICE DEPENDENCY:")
    print("-" * 30)
    
    # Bad: Notification service tied to SMTP email
    notification_bad = NotificationServiceBad()
    result = notification_bad.send_welcome_notification("user@example.com", "Alice")
    print(f"Notification result: {result}")
    print("❌ Problems: Limited to email only, hard to test, no alternatives")
    print()


def demonstrate_dip_compliance():
    """Demonstrate the benefits of following DIP."""
    print("=" * 60)
    print("DEMONSTRATING DIP COMPLIANCE (GOOD EXAMPLES)")
    print("=" * 60)
    
    print("1. DATABASE ABSTRACTION WITH DEPENDENCY INJECTION:")
    print("-" * 50)
    
    # Create different database implementations
    mysql_db = MySQLDatabaseAdapter("mysql://localhost/users")
    postgresql_db = PostgreSQLDatabaseAdapter("postgresql://localhost/users")
    memory_db = InMemoryDatabaseAdapter()
    
    databases = [
        ("MySQL", mysql_db),
        ("PostgreSQL", postgresql_db),
        ("In-Memory", memory_db)
    ]
    
    for db_name, database in databases:
        print(f"Using {db_name} database:")
        # GOOD: Same service works with different database implementations
        user_service = UserService(database)
        user = user_service.create_user(f"User_{db_name}", f"user@{db_name.lower()}.com")
        retrieved_user = user_service.get_user(user["id"])
        print(f"  Created and retrieved: {retrieved_user}")
        user_service.cleanup()
        print()
    
    print("2. LOGGER ABSTRACTION WITH MULTIPLE IMPLEMENTATIONS:")
    print("-" * 50)
    
    # Create different logger implementations
    file_logger = FileLoggerAdapter("orders.log")
    console_logger = ConsoleLoggerAdapter()
    db_logger = DatabaseLoggerAdapter()
    
    # Composite logger using multiple loggers
    multi_logger = CompositeLogger([file_logger, console_logger, db_logger])
    
    loggers = [
        ("File Logger", file_logger),
        ("Console Logger", console_logger),
        ("Database Logger", db_logger),
        ("Multi-Channel Logger", multi_logger)
    ]
    
    for logger_name, logger in loggers:
        print(f"Using {logger_name}:")
        # GOOD: Same processor works with different logger implementations
        processor = OrderProcessor(logger)
        result = processor.process_order("ORD-456", 149.99)
        print(f"  Processing result: {result}")
        print()
    
    print("3. NOTIFICATION ABSTRACTION WITH MULTIPLE CHANNELS:")
    print("-" * 50)
    
    # Create different notification implementations
    email_service = EmailNotificationAdapter("smtp.gmail.com", 587)
    sms_service = SMSNotificationAdapter("api_key_123", "Twilio")
    push_service = PushNotificationAdapter("app_123", "push_key_456")
    
    # Single channel services
    single_channel_services = [
        ("Email Only", [email_service]),
        ("SMS Only", [sms_service]),
        ("Push Only", [push_service])
    ]
    
    for service_name, services in single_channel_services:
        print(f"Using {service_name}:")
        notification_service = MultiChannelNotificationService(services)
        result = notification_service.send_welcome_notification("user@example.com", "Alice")
        print(f"  Available types: {notification_service.get_available_notification_types()}")
        print(f"  Result: {result}")
        print()
    
    # Multi-channel service
    print("Using Multi-Channel Notification Service:")
    multi_notification = MultiChannelNotificationService([email_service, sms_service, push_service])
    result = multi_notification.send_order_confirmation("user@example.com", "ORD-789")
    print(f"  Available types: {multi_notification.get_available_notification_types()}")
    print(f"  Result: {result}")
    print()


def demonstrate_dependency_injection_container():
    """Demonstrate advanced dependency injection with container."""
    print("=" * 60)
    print("DEPENDENCY INJECTION CONTAINER")
    print("=" * 60)
    
    # Create DI container
    container = DIContainer()
    
    # Register dependencies
    container.register_instance("database", InMemoryDatabaseAdapter())
    container.register_instance("logger", ConsoleLoggerAdapter())
    container.register_instance("notification", EmailNotificationAdapter("smtp.example.com", 587))
    container.register_instance("payment", CreditCardPaymentProcessor())
    
    # Create service with injected dependencies
    ecommerce_service = ECommerceService(
        database=container.get("database"),
        logger=container.get("logger"),
        notification=container.get("notification"),
        payment=container.get("payment")
    )
    
    print("E-Commerce Service with Dependency Injection:")
    
    # Create user account
    user = ecommerce_service.create_user_account("Bob Johnson", "bob@example.com")
    print(f"Created user: {user}")
    print()
    
    # Process order
    success = ecommerce_service.process_order(user["id"], 299.99, "credit_card")
    print(f"Order processing success: {success}")
    print()
    
    # Demonstrate swapping implementations
    print("Swapping to different implementations:")
    container.register_instance("database", PostgreSQLDatabaseAdapter("postgresql://localhost/test"))
    container.register_instance("notification", SMSNotificationAdapter("sms_key", "SMS Provider"))
    container.register_instance("payment", PayPalPaymentProcessor())
    
    # Create new service with different implementations
    ecommerce_service2 = ECommerceService(
        database=container.get("database"),
        logger=container.get("logger"),
        notification=container.get("notification"),
        payment=container.get("payment")
    )
    
    user2 = ecommerce_service2.create_user_account("Carol Smith", "carol@example.com")
    print(f"Created user with different implementations: {user2}")
    
    success2 = ecommerce_service2.process_order(user2["id"], 149.99, "paypal")
    print(f"Order processing with different implementations: {success2}")


def demonstrate_testing_benefits():
    """Demonstrate how DIP makes testing easier."""
    print("=" * 60)
    print("TESTING BENEFITS OF DIP")
    print("=" * 60)
    
    print("DIP enables easy testing with mock implementations:")
    print()
    
    # Mock implementations for testing
    class MockDatabase(DatabaseInterface):
        def __init__(self):
            self.users = {}
            self.connected = False
            self.operations = []
        
        def connect(self):
            self.connected = True
            self.operations.append("connect")
        
        def disconnect(self):
            self.connected = False
            self.operations.append("disconnect")
        
        def find_user(self, user_id):
            self.operations.append(f"find_user({user_id})")
            return self.users.get(user_id)
        
        def create_user(self, name, email):
            user = {"id": len(self.users) + 1, "name": name, "email": email}
            self.users[user["id"]] = user
            self.operations.append(f"create_user({name}, {email})")
            return user
        
        def update_user(self, user_id, data):
            if user_id in self.users:
                self.users[user_id].update(data)
                self.operations.append(f"update_user({user_id}, {data})")
                return True
            return False
        
        def delete_user(self, user_id):
            if user_id in self.users:
                del self.users[user_id]
                self.operations.append(f"delete_user({user_id})")
                return True
            return False
    
    class MockLogger:
        def __init__(self):
            self.logs = []
        
        def log(self, message, level="INFO"):
            self.logs.append((level, message))
    
    # Test with mock dependencies
    mock_db = MockDatabase()
    mock_logger = MockLogger()
    
    # Create service with mocks
    user_service = UserService(mock_db)
    
    # Test operations
    user = user_service.create_user("Test User", "test@example.com")
    retrieved_user = user_service.get_user(user["id"])
    
    print("Mock Database Operations:")
    for operation in mock_db.operations:
        print(f"  {operation}")
    print()
    
    print("Created user:", user)
    print("Retrieved user:", retrieved_user)
    print()
    
    # Test with mock logger
    processor = OrderProcessor(mock_logger)
    result = processor.process_order("TEST-001", 50.00)
    
    print("Mock Logger Entries:")
    for level, message in mock_logger.logs:
        print(f"  [{level}] {message}")
    print()
    
    print("✅ Benefits of DIP for testing:")
    print("1. Easy to create mock implementations")
    print("2. No external dependencies needed for tests")
    print("3. Can verify interactions with dependencies")
    print("4. Tests run fast without real databases/services")
    print("5. Can simulate error conditions easily")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("SOLID Principles in Python - Dependency Inversion Principle")
    print("===========================================================")
    print()
    
    demonstrate_dip_violation()
    print()
    
    demonstrate_dip_compliance()
    print()
    
    demonstrate_dependency_injection_container()
    print()
    
    demonstrate_testing_benefits()
    
    print("\n" + "=" * 60)
    print("KEY TAKEAWAYS:")
    print("=" * 60)
    print("1. High-level modules should not depend on low-level modules")
    print("2. Both should depend on abstractions (interfaces)")
    print("3. Abstractions should not depend on details")
    print("4. Details should depend on abstractions")
    print("5. Use dependency injection to provide implementations")
    print("6. DIP enables flexibility, testability, and maintainability")
    print("7. Depend on interfaces, not concrete implementations")
    print("8. Use Abstract Base Classes or Protocols in Python")
    print("9. Constructor injection is the most common DI pattern")
    print("10. DIP supports all other SOLID principles")
    print("11. Makes code more modular and easier to extend")
    print("12. Essential for creating testable applications")
