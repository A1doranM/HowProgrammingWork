"""
SOLID Principles in Python - Interface Segregation Principle (ISP)

The Interface Segregation Principle is the fourth principle of SOLID.
It states that no client should be forced to depend on methods it does not use.

Definition: Many client-specific interfaces are better than one general-purpose interface.

Simply put: Don't force classes to implement methods they don't need.

Why it matters:
- Reduces coupling between classes
- Makes interfaces more focused and cohesive
- Prevents "fat" interfaces that do too much
- Makes code more maintainable and flexible
- Supports the Single Responsibility Principle
- Makes testing easier (smaller, focused interfaces)

When to apply:
- When designing interfaces with multiple responsibilities
- When some clients only need a subset of interface methods
- When you notice classes implementing empty or not-applicable methods
- When interfaces are growing too large

How to achieve:
- Break large interfaces into smaller, more specific ones
- Use role-based interfaces (interfaces based on what clients need)
- Compose multiple small interfaces when needed
- Use Python's Protocol for structural typing
- Apply the principle at the interface design level

Common violations:
- Large interfaces with many unrelated methods
- Classes forced to implement methods they don't use
- Empty or NotImplemented method implementations
- Interfaces that serve multiple different client types
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Protocol
from enum import Enum


# ============================================================================
# BAD EXAMPLE 1 - Fat Worker Interface (ISP Violation)
# ============================================================================

class WorkerBad(ABC):
    """
    BAD EXAMPLE: This is a "fat" interface that forces all workers to implement
    methods they might not need or be able to perform.
    
    Problems:
    1. Not all workers can eat (robots don't eat)
    2. Not all workers need to sleep (robots don't sleep)
    3. Not all workers work the same way
    4. Forces unrelated responsibilities into one interface
    5. Violates Interface Segregation Principle
    """
    
    @abstractmethod
    def work(self) -> str:
        """Perform work tasks."""
        pass
    
    @abstractmethod
    def eat(self) -> str:
        """Take a meal break."""
        pass
    
    @abstractmethod
    def sleep(self) -> str:
        """Take a rest/sleep break."""
        pass
    
    @abstractmethod
    def attend_meeting(self) -> str:
        """Attend company meetings."""
        pass
    
    @abstractmethod
    def take_vacation(self) -> str:
        """Take vacation time."""
        pass


class HumanWorkerBad(WorkerBad):
    """This works fine - humans can do all these activities."""
    
    def __init__(self, name: str):
        self.name = name
    
    def work(self) -> str:
        return f"{self.name} is working on tasks"
    
    def eat(self) -> str:
        return f"{self.name} is eating lunch"
    
    def sleep(self) -> str:
        return f"{self.name} is taking a nap"
    
    def attend_meeting(self) -> str:
        return f"{self.name} is attending a meeting"
    
    def take_vacation(self) -> str:
        return f"{self.name} is on vacation"


class RobotWorkerBad(WorkerBad):
    """
    BAD EXAMPLE: Robot is forced to implement methods it can't or shouldn't use.
    
    Problems:
    1. Robots don't eat - forced to implement anyway
    2. Robots don't sleep - forced to implement anyway  
    3. Robots might not attend meetings - forced to implement anyway
    4. Robots don't take vacations - forced to implement anyway
    5. Violates ISP by depending on methods it doesn't use
    """
    
    def __init__(self, model: str):
        self.model = model
    
    def work(self) -> str:
        return f"Robot {self.model} is processing tasks"
    
    def eat(self) -> str:
        # VIOLATION: Forced to implement a method that doesn't make sense!
        raise NotImplementedError("Robots don't eat!")
    
    def sleep(self) -> str:
        # VIOLATION: Forced to implement a method that doesn't make sense!
        raise NotImplementedError("Robots don't sleep!")
    
    def attend_meeting(self) -> str:
        # VIOLATION: Forced to implement a method that might not apply!
        raise NotImplementedError("This robot doesn't attend meetings!")
    
    def take_vacation(self) -> str:
        # VIOLATION: Forced to implement a method that doesn't make sense!
        raise NotImplementedError("Robots don't take vacations!")


def manage_workers_bad(workers: List[WorkerBad]) -> None:
    """
    This function expects all workers to support all methods.
    It will break when used with robots due to ISP violations.
    """
    print("Managing workers (BAD - violates ISP):")
    for worker in workers:
        print(f"  {worker.work()}")
        try:
            print(f"  {worker.eat()}")
        except NotImplementedError as e:
            print(f"  ❌ ISP VIOLATION: {e}")
        
        try:
            print(f"  {worker.sleep()}")
        except NotImplementedError as e:
            print(f"  ❌ ISP VIOLATION: {e}")


# ============================================================================
# BAD EXAMPLE 2 - Fat Printer Interface (ISP Violation)
# ============================================================================

class MultiFunctionPrinterBad(ABC):
    """
    BAD EXAMPLE: This interface forces all printers to implement all functions,
    even if they don't support them.
    
    Problems:
    1. Simple printers can't scan, fax, or copy
    2. Forces implementation of unsupported methods
    3. Creates unnecessary dependencies
    4. Violates Interface Segregation Principle
    """
    
    @abstractmethod
    def print(self, document: str) -> str:
        """Print a document."""
        pass
    
    @abstractmethod
    def scan(self, document: str) -> str:
        """Scan a document."""
        pass
    
    @abstractmethod
    def copy(self, document: str) -> str:
        """Copy a document."""
        pass
    
    @abstractmethod
    def fax(self, document: str, number: str) -> str:
        """Fax a document."""
        pass


class AdvancedPrinterBad(MultiFunctionPrinterBad):
    """This works fine - advanced printers can do everything."""
    
    def print(self, document: str) -> str:
        return f"Printing: {document}"
    
    def scan(self, document: str) -> str:
        return f"Scanning: {document}"
    
    def copy(self, document: str) -> str:
        return f"Copying: {document}"
    
    def fax(self, document: str, number: str) -> str:
        return f"Faxing {document} to {number}"


class SimplePrinterBad(MultiFunctionPrinterBad):
    """
    BAD EXAMPLE: Simple printer forced to implement methods it doesn't support.
    
    Problems:
    1. Can only print but forced to implement scan, copy, fax
    2. Has to throw exceptions for unsupported operations
    3. Violates ISP by depending on methods it can't use
    4. Creates confusing interface for clients
    """
    
    def print(self, document: str) -> str:
        return f"Simple printer printing: {document}"
    
    def scan(self, document: str) -> str:
        # VIOLATION: Forced to implement unsupported method!
        raise NotImplementedError("Simple printer cannot scan!")
    
    def copy(self, document: str) -> str:
        # VIOLATION: Forced to implement unsupported method!
        raise NotImplementedError("Simple printer cannot copy!")
    
    def fax(self, document: str, number: str) -> str:
        # VIOLATION: Forced to implement unsupported method!
        raise NotImplementedError("Simple printer cannot fax!")


# ============================================================================
# BAD EXAMPLE 3 - Fat Bird Interface (ISP Violation)
# ============================================================================

class BirdBad(ABC):
    """
    BAD EXAMPLE: This interface assumes all birds can do everything,
    forcing implementations to support methods they can't use.
    """
    
    @abstractmethod
    def fly(self) -> str:
        """Fly through the air."""
        pass
    
    @abstractmethod
    def swim(self) -> str:
        """Swim in water."""
        pass
    
    @abstractmethod
    def run(self) -> str:
        """Run on ground."""
        pass
    
    @abstractmethod
    def make_sound(self) -> str:
        """Make bird sounds."""
        pass


class DuckBad(BirdBad):
    """Ducks can do most things, but this interface is still too broad."""
    
    def fly(self) -> str:
        return "Duck is flying"
    
    def swim(self) -> str:
        return "Duck is swimming"
    
    def run(self) -> str:
        return "Duck is waddling quickly"
    
    def make_sound(self) -> str:
        return "Duck says quack"


class PenguinBadISP(BirdBad):
    """
    BAD EXAMPLE: Penguin forced to implement flying, which it can't do.
    """
    
    def fly(self) -> str:
        # VIOLATION: Forced to implement method it can't use!
        raise NotImplementedError("Penguins cannot fly!")
    
    def swim(self) -> str:
        return "Penguin is swimming underwater"
    
    def run(self) -> str:
        return "Penguin is sliding on ice"
    
    def make_sound(self) -> str:
        return "Penguin makes cute sounds"


# ============================================================================
# GOOD EXAMPLE 1 - Segregated Worker Interfaces (Following ISP)
# ============================================================================

class Workable(Protocol):
    """
    GOOD: Focused interface for work-related activities.
    Only contains methods that ALL workers must support.
    """
    
    def work(self) -> str:
        """Perform work tasks."""
        ...


class Eatable(Protocol):
    """
    GOOD: Separate interface for eating activities.
    Only implemented by workers that can eat.
    """
    
    def eat(self) -> str:
        """Take a meal break."""
        ...


class Sleepable(Protocol):
    """
    GOOD: Separate interface for sleeping activities.
    Only implemented by workers that need sleep.
    """
    
    def sleep(self) -> str:
        """Take a rest/sleep break."""
        ...


class Meetable(Protocol):
    """
    GOOD: Separate interface for meeting activities.
    Only implemented by workers that attend meetings.
    """
    
    def attend_meeting(self) -> str:
        """Attend company meetings."""
        ...


class Vacationable(Protocol):
    """
    GOOD: Separate interface for vacation activities.
    Only implemented by workers that take vacations.
    """
    
    def take_vacation(self) -> str:
        """Take vacation time."""
        ...


class HumanWorker:
    """
    GOOD: Human worker implements all interfaces because humans can do all these activities.
    But it's not forced to - it chooses which interfaces to implement.
    """
    
    def __init__(self, name: str):
        self.name = name
    
    def work(self) -> str:
        return f"{self.name} is working on tasks"
    
    def eat(self) -> str:
        return f"{self.name} is eating lunch"
    
    def sleep(self) -> str:
        return f"{self.name} is taking a nap"
    
    def attend_meeting(self) -> str:
        return f"{self.name} is attending a meeting"
    
    def take_vacation(self) -> str:
        return f"{self.name} is on vacation"


class RobotWorker:
    """
    GOOD: Robot worker only implements what it can actually do.
    Not forced to implement eating, sleeping, meetings, or vacations.
    """
    
    def __init__(self, model: str):
        self.model = model
    
    def work(self) -> str:
        return f"Robot {self.model} is processing tasks efficiently"


class ContractorWorker:
    """
    GOOD: Contractor implements only relevant interfaces.
    Contractors work and attend meetings but might not take company vacations.
    """
    
    def __init__(self, name: str):
        self.name = name
    
    def work(self) -> str:
        return f"Contractor {self.name} is working on project"
    
    def eat(self) -> str:
        return f"Contractor {self.name} is having lunch"
    
    def attend_meeting(self) -> str:
        return f"Contractor {self.name} is attending project meeting"


def manage_workable_entities(workers: List[Workable]) -> None:
    """
    GOOD: This function only depends on the Workable interface.
    It works with ANY object that can work, regardless of other capabilities.
    """
    print("Managing workable entities (GOOD - follows ISP):")
    for worker in workers:
        print(f"  {worker.work()}")


def manage_eating_workers(workers: List[Eatable]) -> None:
    """
    GOOD: This function only works with workers that can eat.
    It doesn't try to make robots eat.
    """
    print("Managing workers during lunch:")
    for worker in workers:
        print(f"  {worker.eat()}")


def organize_meetings(attendees: List[Meetable]) -> None:
    """
    GOOD: This function only works with entities that attend meetings.
    """
    print("Organizing meeting:")
    for attendee in attendees:
        print(f"  {attendee.attend_meeting()}")


# ============================================================================
# GOOD EXAMPLE 2 - Segregated Printer Interfaces (Following ISP)
# ============================================================================

class Printable(Protocol):
    """
    GOOD: Focused interface for printing functionality.
    All printers must be able to print.
    """
    
    def print(self, document: str) -> str:
        """Print a document."""
        ...


class Scannable(Protocol):
    """
    GOOD: Separate interface for scanning functionality.
    Only printers with scanning capability implement this.
    """
    
    def scan(self, document: str) -> str:
        """Scan a document."""
        ...


class Copyable(Protocol):
    """
    GOOD: Separate interface for copying functionality.
    Only printers with copying capability implement this.
    """
    
    def copy(self, document: str) -> str:
        """Copy a document."""
        ...


class Faxable(Protocol):
    """
    GOOD: Separate interface for fax functionality.
    Only printers with fax capability implement this.
    """
    
    def fax(self, document: str, number: str) -> str:
        """Fax a document."""
        ...


class SimplePrinter:
    """
    GOOD: Simple printer only implements what it can do.
    Not forced to implement scanning, copying, or faxing.
    """
    
    def __init__(self, model: str):
        self.model = model
    
    def print(self, document: str) -> str:
        return f"{self.model} printing: {document}"


class ScannerPrinter:
    """
    GOOD: Printer with scanning capability implements both interfaces.
    """
    
    def __init__(self, model: str):
        self.model = model
    
    def print(self, document: str) -> str:
        return f"{self.model} printing: {document}"
    
    def scan(self, document: str) -> str:
        return f"{self.model} scanning: {document}"


class MultiFunctionPrinter:
    """
    GOOD: Advanced printer chooses to implement all interfaces.
    Not forced to, but does so because it has all capabilities.
    """
    
    def __init__(self, model: str):
        self.model = model
    
    def print(self, document: str) -> str:
        return f"{self.model} printing: {document}"
    
    def scan(self, document: str) -> str:
        return f"{self.model} scanning: {document}"
    
    def copy(self, document: str) -> str:
        return f"{self.model} copying: {document}"
    
    def fax(self, document: str, number: str) -> str:
        return f"{self.model} faxing {document} to {number}"


def print_documents(printers: List[Printable], documents: List[str]) -> None:
    """
    GOOD: This function only depends on printing capability.
    Works with any printer that can print, regardless of other features.
    """
    print("Printing documents:")
    for printer in printers:
        for doc in documents:
            print(f"  {printer.print(doc)}")


def scan_documents(scanners: List[Scannable], documents: List[str]) -> None:
    """
    GOOD: This function only works with devices that can scan.
    """
    print("Scanning documents:")
    for scanner in scanners:
        for doc in documents:
            print(f"  {scanner.scan(doc)}")


# ============================================================================
# GOOD EXAMPLE 3 - Segregated Bird Interfaces (Following ISP)
# ============================================================================

class SoundMaking(Protocol):
    """
    GOOD: All birds make sounds, so this is a universal interface.
    """
    
    def make_sound(self) -> str:
        """Make bird sounds."""
        ...


class Flying(Protocol):
    """
    GOOD: Only flying birds implement this interface.
    """
    
    def fly(self) -> str:
        """Fly through the air."""
        ...


class Swimming(Protocol):
    """
    GOOD: Only swimming birds implement this interface.
    """
    
    def swim(self) -> str:
        """Swim in water."""
        ...


class Running(Protocol):
    """
    GOOD: Only running birds implement this interface.
    """
    
    def run(self) -> str:
        """Run on ground."""
        ...


class Duck:
    """
    GOOD: Duck implements multiple interfaces because it can do multiple things.
    """
    
    def make_sound(self) -> str:
        return "Duck says quack"
    
    def fly(self) -> str:
        return "Duck is flying"
    
    def swim(self) -> str:
        return "Duck is swimming"
    
    def run(self) -> str:
        return "Duck is waddling quickly"


class Penguin:
    """
    GOOD: Penguin only implements what it can actually do.
    Not forced to implement flying.
    """
    
    def make_sound(self) -> str:
        return "Penguin makes cute sounds"
    
    def swim(self) -> str:
        return "Penguin is swimming underwater gracefully"
    
    def run(self) -> str:
        return "Penguin is sliding on ice"


class Eagle:
    """
    GOOD: Eagle implements interfaces for its capabilities.
    """
    
    def make_sound(self) -> str:
        return "Eagle screeches powerfully"
    
    def fly(self) -> str:
        return "Eagle soars majestically at great heights"


class Ostrich:
    """
    GOOD: Ostrich implements interfaces for its capabilities.
    """
    
    def make_sound(self) -> str:
        return "Ostrich makes deep booming sounds"
    
    def run(self) -> str:
        return "Ostrich runs incredibly fast at 70 km/h"


def make_all_birds_sound(birds: List[SoundMaking]) -> None:
    """
    GOOD: Works with all birds because all birds make sounds.
    """
    print("All birds making sounds:")
    for bird in birds:
        print(f"  {bird.make_sound()}")


def make_flying_birds_fly(birds: List[Flying]) -> None:
    """
    GOOD: Only works with birds that can actually fly.
    No exceptions thrown for flightless birds.
    """
    print("Flying birds in action:")
    for bird in birds:
        print(f"  {bird.fly()}")


def make_swimming_birds_swim(birds: List[Swimming]) -> None:
    """
    GOOD: Only works with birds that can actually swim.
    """
    print("Swimming birds in action:")
    for bird in birds:
        print(f"  {bird.swim()}")


# ============================================================================
# ADVANCED EXAMPLE - Role-Based Interfaces
# ============================================================================

class Readable(Protocol):
    """Interface for objects that can be read."""
    def read(self) -> str: ...


class Writable(Protocol):
    """Interface for objects that can be written to."""
    def write(self, data: str) -> None: ...


class Closeable(Protocol):
    """Interface for objects that can be closed."""
    def close(self) -> None: ...


class File:
    """A file that can be read, written to, and closed."""
    
    def __init__(self, filename: str, mode: str = "r"):
        self.filename = filename
        self.mode = mode
        self.closed = False
    
    def read(self) -> str:
        if self.closed:
            raise ValueError("Cannot read from closed file")
        return f"Reading from {self.filename}"
    
    def write(self, data: str) -> None:
        if self.closed:
            raise ValueError("Cannot write to closed file")
        if "w" not in self.mode and "a" not in self.mode:
            raise ValueError("File not open for writing")
        print(f"Writing '{data}' to {self.filename}")
    
    def close(self) -> None:
        self.closed = True
        print(f"Closed {self.filename}")


class ReadOnlyFile:
    """A read-only file that can be read and closed but not written to."""
    
    def __init__(self, filename: str):
        self.filename = filename
        self.closed = False
    
    def read(self) -> str:
        if self.closed:
            raise ValueError("Cannot read from closed file")
        return f"Reading from read-only {self.filename}"
    
    def close(self) -> None:
        self.closed = True
        print(f"Closed read-only {self.filename}")


class NetworkStream:
    """A network stream that can be read and closed but not written to like a file."""
    
    def __init__(self, url: str):
        self.url = url
        self.closed = False
    
    def read(self) -> str:
        if self.closed:
            raise ValueError("Cannot read from closed stream")
        return f"Reading from network stream {self.url}"
    
    def close(self) -> None:
        self.closed = True
        print(f"Closed network stream {self.url}")


def read_from_source(source: Readable) -> str:
    """Read from any readable source."""
    return source.read()


def write_to_destination(destination: Writable, data: str) -> None:
    """Write to any writable destination."""
    destination.write(data)


def cleanup_resources(resources: List[Closeable]) -> None:
    """Close any closeable resources."""
    for resource in resources:
        resource.close()


# ============================================================================
# DEMONSTRATION CODE
# ============================================================================

def demonstrate_isp_violation():
    """Demonstrate the problems with violating ISP."""
    print("=" * 60)
    print("DEMONSTRATING ISP VIOLATION (BAD EXAMPLES)")
    print("=" * 60)
    
    # Worker interface violation
    print("1. FAT WORKER INTERFACE:")
    print("-" * 30)
    
    workers = [
        HumanWorkerBad("Alice"),
        RobotWorkerBad("R2D2")
    ]
    
    manage_workers_bad(workers)
    print()
    
    # Printer interface violation
    print("2. FAT PRINTER INTERFACE:")
    print("-" * 30)
    
    printers = [
        AdvancedPrinterBad(),
        SimplePrinterBad()
    ]
    
    for printer in printers:
        print(f"Printer: {printer.__class__.__name__}")
        print(f"  {printer.print('document.pdf')}")
        try:
            print(f"  {printer.scan('photo.jpg')}")
        except NotImplementedError as e:
            print(f"  ❌ ISP VIOLATION: {e}")
        print()
    
    # Bird interface violation
    print("3. FAT BIRD INTERFACE:")
    print("-" * 30)
    
    birds = [
        DuckBad(),
        PenguinBadISP()
    ]
    
    for bird in birds:
        print(f"Bird: {bird.__class__.__name__}")
        try:
            print(f"  {bird.fly()}")
        except NotImplementedError as e:
            print(f"  ❌ ISP VIOLATION: {e}")
        print(f"  {bird.swim()}")
        print()


def demonstrate_isp_compliance():
    """Demonstrate the benefits of following ISP."""
    print("=" * 60)
    print("DEMONSTRATING ISP COMPLIANCE (GOOD EXAMPLES)")
    print("=" * 60)
    
    # Segregated worker interfaces
    print("1. SEGREGATED WORKER INTERFACES:")
    print("-" * 30)
    
    human = HumanWorker("Alice")
    robot = RobotWorker("R2D2")
    contractor = ContractorWorker("Bob")
    
    # All can work
    all_workers = [human, robot, contractor]
    manage_workable_entities(all_workers)
    print()
    
    # Only some can eat
    eating_workers = [human, contractor]  # Robot excluded naturally
    manage_eating_workers(eating_workers)
    print()
    
    # Only some attend meetings
    meeting_attendees = [human, contractor]  # Robot excluded naturally
    organize_meetings(meeting_attendees)
    print()
    
    # Segregated printer interfaces
    print("2. SEGREGATED PRINTER INTERFACES:")
    print("-" * 30)
    
    simple = SimplePrinter("BasicPrint-1000")
    scanner_printer = ScannerPrinter("ScanPrint-2000")
    multifunction = MultiFunctionPrinter("AllInOne-3000")
    
    documents = ["report.pdf", "presentation.pptx"]
    
    # All can print
    all_printers = [simple, scanner_printer, multifunction]
    print_documents(all_printers, documents)
    print()
    
    # Only some can scan
    scanners = [scanner_printer, multifunction]  # simple excluded naturally
    scan_documents(scanners, documents)
    print()
    
    # Segregated bird interfaces
    print("3. SEGREGATED BIRD INTERFACES:")
    print("-" * 30)
    
    duck = Duck()
    penguin = Penguin()
    eagle = Eagle()
    ostrich = Ostrich()
    
    all_birds = [duck, penguin, eagle, ostrich]
    
    # All birds make sounds
    make_all_birds_sound(all_birds)
    print()
    
    # Only some can fly
    flying_birds = [duck, eagle]  # penguin and ostrich excluded naturally
    make_flying_birds_fly(flying_birds)
    print()
    
    # Only some can swim
    swimming_birds = [duck, penguin]  # eagle and ostrich excluded naturally
    make_swimming_birds_swim(swimming_birds)
    print()


def demonstrate_role_based_interfaces():
    """Demonstrate role-based interface design."""
    print("=" * 60)
    print("ROLE-BASED INTERFACES")
    print("=" * 60)
    
    # Create different types of file-like objects
    regular_file = File("document.txt", "rw")
    readonly_file = ReadOnlyFile("config.ini")
    network_stream = NetworkStream("http://api.example.com/data")
    
    # Read from all readable sources
    readable_sources = [regular_file, readonly_file, network_stream]
    print("Reading from various sources:")
    for source in readable_sources:
        print(f"  {read_from_source(source)}")
    print()
    
    # Write only to writable destinations
    writable_destinations = [regular_file]  # Only regular file is writable
    print("Writing to writable destinations:")
    for dest in writable_destinations:
        write_to_destination(dest, "Important data")
    print()
    
    # Close all closeable resources
    closeable_resources = [regular_file, readonly_file, network_stream]
    print("Cleaning up resources:")
    cleanup_resources(closeable_resources)
    print()


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("SOLID Principles in Python - Interface Segregation Principle")
    print("============================================================")
    print()
    
    demonstrate_isp_violation()
    print()
    
    demonstrate_isp_compliance()
    print()
    
    demonstrate_role_based_interfaces()
    
    print("=" * 60)
    print("KEY TAKEAWAYS:")
    print("=" * 60)
    print("1. Don't force clients to depend on methods they don't use")
    print("2. Break large interfaces into smaller, more focused ones")
    print("3. Use role-based interfaces based on client needs")
    print("4. Prefer composition of multiple small interfaces")
    print("5. Python's Protocol enables structural typing for ISP")
    print("6. ISP reduces coupling and increases flexibility")
    print("7. Empty or NotImplemented methods often indicate ISP violations")
    print("8. Design interfaces from the client's perspective")
    print("9. ISP supports SRP at the interface level")
    print("10. Many small interfaces are better than one large interface")
