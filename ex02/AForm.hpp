#ifndef AFORM_HPP
# define AFORM_HPP

# include <iostream>
# include <string>
# include <stdexcept>

class Bureaucrat;

class AForm
{
	private:
		const std::string	_name;
		bool				_signed;
		const int			_gradeToSign;
		const int			_gradeToExec;

	public:
		AForm();
		AForm(const std::string& name, int gradeToSign, int gradeToExec);
		AForm(const AForm& other);
		AForm& operator=(const AForm& other);
		virtual ~AForm();

		const std::string&	getName() const;
		bool				getSigned() const;
		int					getGradeToSign() const;
		int					getGradeToExec() const;

		void			beSigned(const Bureaucrat& b);
		void			execute(Bureaucrat const& executor) const;

		class GradeTooHighException : public std::exception
		{
			public:
				virtual const char* what() const throw();
		};

		class GradeTooLowException : public std::exception
		{
			public:
				virtual const char* what() const throw();
		};

		class FormNotSignedException : public std::exception
		{
			public:
				virtual const char* what() const throw();
		};

	protected:
		virtual void	action() const = 0;
};

std::ostream& operator<<(std::ostream& os, const AForm& f);

#endif
