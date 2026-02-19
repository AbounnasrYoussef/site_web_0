#include "Bureaucrat.hpp"
#include "AForm.hpp"
#include "ShrubberyCreationForm.hpp"
#include "RobotomyRequestForm.hpp"
#include "PresidentialPardonForm.hpp"

int main()
{
	std::cout << "===== TEST 1: ShrubberyCreationForm =====" << std::endl;
	try
	{
		Bureaucrat bob("Bob", 1);
		ShrubberyCreationForm shrub("home");
		std::cout << shrub << std::endl;
		bob.signForm(shrub);
		bob.executeForm(shrub);
		std::cout << "Check file: home_shrubbery" << std::endl;
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 2: RobotomyRequestForm =====" << std::endl;
	try
	{
		Bureaucrat alice("Alice", 1);
		RobotomyRequestForm robot("Bender");
		std::cout << robot << std::endl;
		alice.signForm(robot);
		alice.executeForm(robot);
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 3: PresidentialPardonForm =====" << std::endl;
	try
	{
		Bureaucrat president("President", 1);
		PresidentialPardonForm pardon("Arthur Dent");
		std::cout << pardon << std::endl;
		president.signForm(pardon);
		president.executeForm(pardon);
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 4: Execute unsigned form =====" << std::endl;
	try
	{
		Bureaucrat charlie("Charlie", 1);
		ShrubberyCreationForm shrub2("garden");
		charlie.executeForm(shrub2); // Not signed → should fail
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 5: Grade too low to sign =====" << std::endl;
	try
	{
		Bureaucrat intern("Intern", 150);
		PresidentialPardonForm pardon2("Ford Prefect");
		intern.signForm(pardon2); // Grade 150 < required 25 → fail
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	std::cout << std::endl;
	std::cout << "===== TEST 6: Grade too low to execute =====" << std::endl;
	try
	{
		Bureaucrat boss("Boss", 1);
		Bureaucrat low("Low", 100);
		RobotomyRequestForm robot2("Marvin");
		boss.signForm(robot2);
		low.executeForm(robot2); // Grade 100 > required 45 → fail
	}
	catch (std::exception& e)
	{
		std::cout << "Exception: " << e.what() << std::endl;
	}

	return 0;
}
