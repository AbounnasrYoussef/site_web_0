# Exercise 00 : Mommy, when I grow up, I want to be a bureaucrat!

## 📚 Concept

Cet exercice introduit les **exceptions en C++**. On crée une classe `Bureaucrat` avec un **nom constant** et un **grade** (1 = le plus haut, 150 = le plus bas). Si le grade sort de cette plage, une **exception** est lancée.

### Notions clés :
- **Exceptions** : mécanisme de gestion d'erreurs avec `throw`, `try`, `catch`
- **Classes d'exceptions personnalisées** : héritent de `std::exception`
- **Orthodox Canonical Form** : constructeur par défaut, constructeur de copie, opérateur d'affectation, destructeur
- **Surcharge de l'opérateur `<<`** : pour afficher un objet avec `std::cout`

---

## 📁 Fichiers

| Fichier | Description |
|---------|------------|
| `Bureaucrat.hpp` | Déclaration de la classe Bureaucrat |
| `Bureaucrat.cpp` | Implémentation de la classe Bureaucrat |
| `main.cpp` | Programme de test |
| `Makefile` | Fichier de compilation |

---

## 🔍 Explication du code ligne par ligne

### Bureaucrat.hpp

```cpp
#ifndef BUREAUCRAT_HPP          // Protection contre la double inclusion
# define BUREAUCRAT_HPP

# include <iostream>            // Pour std::cout, std::ostream
# include <string>              // Pour std::string
# include <stdexcept>           // Pour std::exception

class Bureaucrat
{
    private:
        const std::string _name;  // Nom constant (ne change jamais après construction)
        int               _grade; // Grade entre 1 (max) et 150 (min)

    public:
        // --- Orthodox Canonical Form ---
        Bureaucrat();                                  // Constructeur par défaut
        Bureaucrat(const std::string& name, int grade);// Constructeur paramétré
        Bureaucrat(const Bureaucrat& other);            // Constructeur de copie
        Bureaucrat& operator=(const Bureaucrat& other); // Opérateur d'affectation
        ~Bureaucrat();                                  // Destructeur

        // --- Getters ---
        const std::string& getName() const;   // Retourne le nom
        int                getGrade() const;  // Retourne le grade

        // --- Modificateurs de grade ---
        void incrementGrade();  // Grade - 1 (monte en grade, 3 -> 2)
        void decrementGrade();  // Grade + 1 (descend en grade, 3 -> 4)

        // --- Classes d'exceptions imbriquées ---
        class GradeTooHighException : public std::exception  // Hérite de std::exception
        {
            public:
                virtual const char* what() const throw();  // Message d'erreur
        };

        class GradeTooLowException : public std::exception
        {
            public:
                virtual const char* what() const throw();
        };
};

// Surcharge de << pour afficher : "nom, bureaucrat grade X."
std::ostream& operator<<(std::ostream& os, const Bureaucrat& b);

#endif
```

### Bureaucrat.cpp

```cpp
#include "Bureaucrat.hpp"   // Inclusion du header

// --- Constructeur par défaut : nom="Default", grade=150 ---
Bureaucrat::Bureaucrat() : _name("Default"), _grade(150)
{
    std::cout << "Bureaucrat default constructor called" << std::endl;
}

// --- Constructeur paramétré : vérifie les limites du grade ---
Bureaucrat::Bureaucrat(const std::string& name, int grade) : _name(name)
{
    if (grade < 1)                              // Si grade < 1 → trop haut
        throw Bureaucrat::GradeTooHighException();
    if (grade > 150)                            // Si grade > 150 → trop bas
        throw Bureaucrat::GradeTooLowException();
    _grade = grade;                             // Grade valide, on l'assigne
    std::cout << "Bureaucrat parameterized constructor called" << std::endl;
}

// --- Constructeur de copie : copie nom et grade ---
Bureaucrat::Bureaucrat(const Bureaucrat& other) : _name(other._name), _grade(other._grade)
{
    std::cout << "Bureaucrat copy constructor called" << std::endl;
}

// --- Opérateur d'affectation : copie le grade uniquement (nom est const) ---
Bureaucrat& Bureaucrat::operator=(const Bureaucrat& other)
{
    if (this != &other)       // Protection contre l'auto-affectation
        _grade = other._grade;  // On ne peut pas copier _name car il est const
    std::cout << "Bureaucrat assignment operator called" << std::endl;
    return *this;             // Retourne une référence pour le chainage (a = b = c)
}

// --- Destructeur ---
Bureaucrat::~Bureaucrat()
{
    std::cout << "Bureaucrat destructor called" << std::endl;
}

// --- Getter : retourne le nom ---
const std::string& Bureaucrat::getName() const { return _name; }

// --- Getter : retourne le grade ---
int Bureaucrat::getGrade() const { return _grade; }

// --- Increment : grade - 1 (monter en grade). Ex: 3 → 2 ---
void Bureaucrat::incrementGrade()
{
    if (_grade - 1 < 1)                         // Si on descend en dessous de 1
        throw Bureaucrat::GradeTooHighException();
    _grade--;                                   // Sinon, on décrémente
}

// --- Decrement : grade + 1 (descendre en grade). Ex: 3 → 4 ---
void Bureaucrat::decrementGrade()
{
    if (_grade + 1 > 150)                       // Si on dépasse 150
        throw Bureaucrat::GradeTooLowException();
    _grade++;                                   // Sinon, on incrémente
}

// --- Exception : message quand le grade est trop haut ---
const char* Bureaucrat::GradeTooHighException::what() const throw()
{
    return "Grade is too high!";
}

// --- Exception : message quand le grade est trop bas ---
const char* Bureaucrat::GradeTooLowException::what() const throw()
{
    return "Grade is too low!";
}

// --- Surcharge de << : affiche "nom, bureaucrat grade X." ---
std::ostream& operator<<(std::ostream& os, const Bureaucrat& b)
{
    os << b.getName() << ", bureaucrat grade " << b.getGrade() << ".";
    return os;
}
```

### main.cpp

```cpp
#include "Bureaucrat.hpp"

int main()
{
    // TEST 1 : Création normale d'un Bureaucrat avec grade valide (42)
    // TEST 2 : Grade 0 → lance GradeTooHighException
    // TEST 3 : Grade 151 → lance GradeTooLowException
    // TEST 4 : Increment de grade 2 → 1 → essai d'aller à 0 → exception
    // TEST 5 : Decrement de grade 149 → 150 → essai d'aller à 151 → exception
    // TEST 6 : Copie d'un Bureaucrat avec le constructeur de copie
}
```

---

## 🔨 Compilation et exécution

### Étapes de compilation :

```bash
# 1. Compiler le projet avec Make
make

# Ce que Make exécute en détail :
# c++ -Wall -Wextra -Werror -std=c++98 -c main.cpp -o main.o
#   → Compile main.cpp en fichier objet main.o
# c++ -Wall -Wextra -Werror -std=c++98 -c Bureaucrat.cpp -o Bureaucrat.o
#   → Compile Bureaucrat.cpp en fichier objet Bureaucrat.o
# c++ -Wall -Wextra -Werror -std=c++98 main.o Bureaucrat.o -o bureaucrat
#   → Lie (link) les fichiers objets pour créer l'exécutable "bureaucrat"

# 2. Exécuter le programme
./bureaucrat

# 3. Nettoyer les fichiers objets
make clean

# 4. Nettoyer tout (objets + exécutable)
make fclean

# 5. Recompiler entièrement
make re
```

### Flags de compilation expliqués :
| Flag | Signification |
|------|--------------|
| `-Wall` | Active tous les avertissements courants |
| `-Wextra` | Active les avertissements supplémentaires |
| `-Werror` | Transforme les avertissements en erreurs |
| `-std=c++98` | Utilise le standard C++98 |

---

## 📊 Sortie attendue

```
===== TEST 1: Valid Bureaucrat =====
Bureaucrat parameterized constructor called
Alice, bureaucrat grade 42.
Bureaucrat destructor called

===== TEST 2: Grade too high (0) =====
Exception: Grade is too high!

===== TEST 3: Grade too low (151) =====
Exception: Grade is too low!

===== TEST 4: Increment grade =====
Bureaucrat parameterized constructor called
Diana, bureaucrat grade 2.
After increment: Diana, bureaucrat grade 1.
Exception: Grade is too high!
Bureaucrat destructor called

===== TEST 5: Decrement grade =====
Bureaucrat parameterized constructor called
Eve, bureaucrat grade 149.
After decrement: Eve, bureaucrat grade 150.
Exception: Grade is too low!
Bureaucrat destructor called

===== TEST 6: Copy constructor =====
Bureaucrat parameterized constructor called
Bureaucrat copy constructor called
Original: Frank, bureaucrat grade 75.
Copy:     Frank, bureaucrat grade 75.
Bureaucrat destructor called
Bureaucrat destructor called
```
