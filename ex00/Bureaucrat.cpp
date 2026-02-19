#include "Bureaucrat.hpp"

// ========================== Orthodox Canonical Form ==========================

Bureaucrat::Bureaucrat() : _name("Default"), _grade(150)
{
	std::cout << "Bureaucrat default constructor called" << std::endl;
}

Bureaucrat::Bureaucrat(const std::string& name, int grade) : _name(name)
{
	if (grade < 1)
		throw Bureaucrat::GradeTooHighException();
	if (grade > 150)
		throw Bureaucrat::GradeTooLowException();
	_grade = grade;
	std::cout << "Bureaucrat parameterized constructor called" << std::endl;
}

Bureaucrat::Bureaucrat(const Bureaucrat& other) : _name(other._name), _grade(other._grade)
{
	std::cout << "Bureaucrat copy constructor called" << std::endl;
}

Bureaucrat& Bureaucrat::operator=(const Bureaucrat& other)
{
	if (this != &other)
	{
		// _name is const, cannot be assigned
		_grade = other._grade;
	}
	std::cout << "Bureaucrat assignment operator called" << std::endl;
	return *this;
}

Bureaucrat::~Bureaucrat()
{
	std::cout << "Bureaucrat destructor called" << std::endl;
}

// ================================= Getters =================================

const std::string& Bureaucrat::getName() const
{
	return _name;
}

int Bureaucrat::getGrade() const
{
	return _grade;
}

// ============================= Grade Modifiers =============================

void Bureaucrat::incrementGrade()
{
	if (_grade - 1 < 1)
		throw Bureaucrat::GradeTooHighException();
	_grade--;
}

void Bureaucrat::decrementGrade()
{
	if (_grade + 1 > 150)
		throw Bureaucrat::GradeTooLowException();
	_grade++;
}

// ============================== Exceptions ==================================

const char* Bureaucrat::GradeTooHighException::what() const throw()
{
	return "Grade is too high!";
}

const char* Bureaucrat::GradeTooLowException::what() const throw()
{
	return "Grade is too low!";
}

// ========================= Insertion Operator ===============================

std::ostream& operator<<(std::ostream& os, const Bureaucrat& b)
{
	os << b.getName() << ", bureaucrat grade " << b.getGrade() << ".";
	return os;
}
