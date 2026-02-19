# Exercise 03 : At least this beats coffee-making

## 📚 Concept

Cet exercice introduit le **pattern Factory** via la classe `Intern`. L'Intern n'a pas de nom ni de grade, mais possède la capacité de créer des formulaires grâce à `makeForm()`. L'implémentation utilise un **tableau de pointeurs sur fonctions membres** au lieu d'une chaîne `if/else`, ce qui est plus propre et extensible.

### Notions clés :
- **Factory Pattern** : une fonction qui crée des objets sans exposer la logique de création
- **Pointeurs sur fonctions membres** : `typedef AForm* (Intern::*FormCreator)(const std::string&)`
- **Allocation dynamique** : `new` pour créer les formulaires (appelant doit `delete`)
- **Pas de if/else** : utilisation d'un tableau associatif nom ↔ fonction de création

---

## 📁 Fichiers

| Fichier | Description |
|---------|------------|
| `Intern.hpp/cpp` | Classe Intern avec `makeForm()` |
| Fichiers ex02 | Toutes les classes de l'exercice précédent |
| `main.cpp` | Tests |
| `Makefile` | Compilation |

---

## 🔍 Explication du code ligne par ligne

### Intern.hpp

```cpp
class Intern
{
    public:
        Intern();                              // Constructeur par défaut
        Intern(const Intern& other);           // Copie
        Intern& operator=(const Intern& other);// Affectation
        ~Intern();                             // Destructeur

        AForm* makeForm(const std::string& name, const std::string& target);
        // Crée un formulaire en fonction du nom et retourne un pointeur

    private:
        // Fonctions privées de création : une par type de formulaire
        AForm* createShrubbery(const std::string& target);
        AForm* createRobotomy(const std::string& target);
        AForm* createPresidential(const std::string& target);
};
```

### Intern.cpp — makeForm() avec tableau de pointeurs

```cpp
AForm* Intern::makeForm(const std::string& name, const std::string& target)
{
    // Tableau des noms de formulaires reconnus
    std::string formNames[] = {
        "shrubbery creation",
        "robotomy request",
        "presidential pardon"
    };

    // Typedef : pointeur sur fonction membre de Intern
    // qui prend un string et retourne un AForm*
    typedef AForm* (Intern::*FormCreator)(const std::string&);

    // Tableau des fonctions de création correspondantes
    FormCreator creators[] = {
        &Intern::createShrubbery,    // formNames[0] → ShrubberyCreationForm
        &Intern::createRobotomy,     // formNames[1] → RobotomyRequestForm
        &Intern::createPresidential  // formNames[2] → PresidentialPardonForm
    };

    // Recherche du nom dans le tableau
    for (int i = 0; i < 3; i++)
    {
        if (name == formNames[i])   // Si le nom correspond
        {
            AForm* form = (this->*creators[i])(target);  // Appelle la fonction de création
            std::cout << "Intern creates " << form->getName() << std::endl;
            return form;            // Retourne le formulaire créé avec new
        }
    }
    // Si aucun nom ne correspond
    std::cout << "Intern couldn't create form: \"" << name
              << "\" does not exist." << std::endl;
    return NULL;  // Retourne NULL
}

// Fonctions de création : chacune fait un "new" et retourne le pointeur
AForm* Intern::createShrubbery(const std::string& target)
{ return new ShrubberyCreationForm(target); }

AForm* Intern::createRobotomy(const std::string& target)
{ return new RobotomyRequestForm(target); }

AForm* Intern::createPresidential(const std::string& target)
{ return new PresidentialPardonForm(target); }
```

### Utilisation dans main.cpp

```cpp
Intern  someRandomIntern;
AForm*  rrf;

rrf = someRandomIntern.makeForm("robotomy request", "Bender");
// → Intern creates RobotomyRequestForm
// rrf pointe vers un RobotomyRequestForm alloué avec new

if (rrf)
{
    boss.signForm(*rrf);      // Signer
    boss.executeForm(*rrf);   // Exécuter
    delete rrf;               // IMPORTANT: libérer la mémoire!
}
```

---

## 🔨 Compilation et exécution

```bash
make          # Compile
./intern      # Exécute
make fclean   # Nettoie
```

---

## 📊 Sortie attendue

```
===== TEST 1: Create robotomy request =====
Intern creates RobotomyRequestForm
Boss signed RobotomyRequestForm
* DRILLING NOISES * Bzzzzzzz...
Bender has been robotomized successfully!
Boss executed RobotomyRequestForm

===== TEST 2: Create shrubbery creation =====
Intern creates ShrubberyCreationForm
Bob signed ShrubberyCreationForm
Bob executed ShrubberyCreationForm

===== TEST 3: Create presidential pardon =====
Intern creates PresidentialPardonForm
President signed PresidentialPardonForm
Arthur Dent has been pardoned by Zaphod Beeblebrox.
President executed PresidentialPardonForm

===== TEST 4: Create unknown form =====
Intern couldn't create form: "unknown form" does not exist.
Form pointer is NULL
```

---

## ⚠️ Points importants

1. **Mémoire** : `makeForm()` retourne un pointeur alloué avec `new` → toujours faire `delete` après utilisation
2. **NULL check** : toujours vérifier si le pointeur retourné n'est pas NULL avant de l'utiliser
3. **Pas de if/else** : l'utilisation du tableau de pointeurs sur fonctions est la méthode propre demandée par le sujet
