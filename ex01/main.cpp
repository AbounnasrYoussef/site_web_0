#include "Bureaucrat.hpp"
#include "Form.hpp"

int main()
{
	std::cout << "===== TEST 1: Create a valid Form =====" << std::endl;
	try
	{
		Form f1("Tax Form A28", 50, 25);
		std::cout << f1 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 2: Form with invalid grade (too high) =====" << std::endl;
	try
	{
		Form f2("Bad Form", 0, 25);
		std::cout << f2 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 3: Form with invalid grade (too low) =====" << std::endl;
	try
	{
		Form f3("Bad Form", 50, 151);
		std::cout << f3 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 4: Bureaucrat signs a Form (success) =====" << std::endl;
	try
	{
		Bureaucrat b1("Alice", 10);
		Form f4("Access Form", 50, 25);
		std::cout << f4 << std::endl;
		b1.signForm(f4);
		std::cout << f4 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 5: Bureaucrat signs a Form (failure) =====" << std::endl;
	try
	{
		Bureaucrat b2("Bob", 100);
		Form f5("Top Secret Form", 10, 5);
		std::cout << f5 << std::endl;
		b2.signForm(f5);
		std::cout << f5 << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 6: Copy Form =====" << std::endl;
	try
	{
		Form f6("Original Form", 42, 21);
		Form f6Copy(f6);
		std::cout << "Original: " << f6 << std::endl;
		std::cout << "Copy:     " << f6Copy << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	return 0;
}
