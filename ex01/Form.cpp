#include "Form.hpp"
#include "Bureaucrat.hpp"

Form::Form() : _name("Default Form"), _signed(false), _gradeToSign(150), _gradeToExec(150)
{
	std::cout << "Form default constructor called" << std::endl;
}

Form::Form(const std::string& name, int gradeToSign, int gradeToExec)
	: _name(name), _signed(false), _gradeToSign(gradeToSign), _gradeToExec(gradeToExec)
{
	if (gradeToSign < 1 || gradeToExec < 1)
		throw Form::GradeTooHighException();
	if (gradeToSign > 150 || gradeToExec > 150)
		throw Form::GradeTooLowException();
	std::cout << "Form parameterized constructor called" << std::endl;
}

Form::Form(const Form& other)
	: _name(other._name), _signed(other._signed),
	  _gradeToSign(other._gradeToSign), _gradeToExec(other._gradeToExec)
{
	std::cout << "Form copy constructor called" << std::endl;
}

Form& Form::operator=(const Form& other)
{
	if (this != &other)
		_signed = other._signed;
	std::cout << "Form assignment operator called" << std::endl;
	return *this;
}

Form::~Form()
{
	std::cout << "Form destructor called" << std::endl;
}

const std::string& Form::getName() const
{
	return _name;
}

bool Form::getSigned() const
{
	return _signed;
}

int Form::getGradeToSign() const
{
	return _gradeToSign;
}

int Form::getGradeToExec() const
{
	return _gradeToExec;
}

void Form::beSigned(const Bureaucrat& b)
{
	if (b.getGrade() > _gradeToSign)
		throw Form::GradeTooLowException();
	_signed = true;
}

const char* Form::GradeTooHighException::what() const throw()
{
	return "Grade is too high!";
}

const char* Form::GradeTooLowException::what() const throw()
{
	return "Grade is too low!";
}

std::ostream& operator<<(std::ostream& os, const Form& f)
{
	os << "Form " << f.getName()
	   << " | Signed: " << (f.getSigned() ? "Yes" : "No")
	   << " | Grade to sign: " << f.getGradeToSign()
	   << " | Grade to execute: " << f.getGradeToExec();
	return os;
}
