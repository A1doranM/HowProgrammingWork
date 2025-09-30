"""
Run all tests for the deep learning framework.
This script executes all the test files in the current directory.
"""

import subprocess
import sys
import os
import glob


def run_test_file(test_file_path):
    """
    Run a single test file and return success status.
    
    Parameters
    ----------
    test_file_path : str
        Path to the test file to run
        
    Returns
    -------
    bool
        True if the test succeeded, False otherwise
    """
    print(f"\n{'='*60}")
    print(f"Running: {test_file_path}")
    print(f"{'='*60}")
    
    result = subprocess.run(
        [sys.executable, test_file_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Print the output
    print(result.stdout)
    if result.stderr:
        print("ERRORS:")
        print(result.stderr)
    
    return result.returncode == 0


def main():
    """Run all the test files and report the overall result."""
    # Get the directory of this script (which is now the tests directory)
    tests_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Find all test_*.py files in the current directory
    test_files = sorted(glob.glob(os.path.join(tests_dir, 'test_*.py')))
    
    # Skip this file itself
    this_file = os.path.basename(__file__)
    test_files = [f for f in test_files if os.path.basename(f) != this_file]
    
    if not test_files:
        print("No test files found!")
        return 1
    
    # Print the test files to be run
    print(f"Found {len(test_files)} test files:")
    for test_file in test_files:
        print(f"  - {os.path.basename(test_file)}")
    
    # Run each test file
    results = {}
    all_passed = True
    
    for test_file in test_files:
        if not os.path.exists(test_file):
            print(f"Warning: Test file not found: {test_file}")
            continue
            
        success = run_test_file(test_file)
        results[os.path.basename(test_file)] = success
        all_passed = all_passed and success
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_file, success in results.items():
        status = "PASSED" if success else "FAILED"
        print(f"{test_file}: {status}")
    
    print("\nOVERALL RESULT:", "PASSED" if all_passed else "FAILED")
    
    # Return exit code
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
