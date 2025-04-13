"""
Run all tests for the deep learning framework.
This script executes the tests in the deeplearning_framework/tests directory.
"""

import os
import sys
import subprocess

# Just forward to the tests directory's run_all_tests.py
if __name__ == "__main__":
    print("Running tests from deeplearning_framework/tests directory...")
    
    # Get the directory of this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the tests directory
    tests_dir = os.path.join(base_dir, 'deeplearning_framework', 'tests')
    
    # Run the tests
    tests_runner = os.path.join(tests_dir, 'run_all_tests.py')
    
    if not os.path.exists(tests_runner):
        print(f"Error: Test runner script not found at {tests_runner}")
        sys.exit(1)
        
    print(f"Forwarding to {tests_runner}")
    
    # Execute the test runner using subprocess.run which handles spaces in paths better
    subprocess.run([sys.executable, tests_runner], check=True)
