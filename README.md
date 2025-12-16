# SketchNLearn

**Course:** CSE 518: Foundations of Human Computer Interaction Final Project

## Project Description

**SketchNLearn** is an interactive, multi-modal learning application designed for digital classrooms. The project combines hand-drawn input recognition, multiple-choice quizzes, and immediate feedback to create an engaging learning experience for children. The application supports learning letters, numbers, animals, and shapes, and is designed using HCI principles for intuitive and effective interaction.

### Features
- **Drawing Canvas:** Users can draw letters or numbers, with real-time recognition using a pretrained EMNIST model.
- **Multi-Choice Quizzes:** Animals and shapes quizzes using emoji or icons for easy recognition.
- **Immediate Feedback:** Color-coded feedback and optional sound cues (ding/buzz) for correct or incorrect answers.
- **Target Sequencing:** Tracks user progress through a sequence of learning targets.
- **Multi-modal Interaction:** Combines visual, auditory, and kinesthetic engagement.

### Technologies Used
- HTML, CSS, JavaScript
- TensorFlow.js for client-side machine learning (EMNIST Letters + Numbers Models)
- Font Awesome / Emoji for quiz options
- Event-driven architecture for modular interaction

### Installation & Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/nadkad/SketchNLearn.git
   ```
2. Navigate into the project folder:
    ```bash
    cd SketchNLearn
    ```
3. Start a local server (Python example):
    ```bash
    python3 -m http.server 8000
    ```
4. Open your browser at:
   http://localhost:8000
6. The application should load, and you can start interacting with the canvas and quizzes.

### Repository Structure
```bash
/assets        # Icons, emoji resources, or images
/drawing       # Canvas and recognizer JS modules
/models        # Pretrained EMNIST model files
index.html     # Main HTML file
app.js         # Main app logic
README.md      # Project documentation
```

## Acknowledgements

Pretrained EMNIST models: https://github.com/4ltrem/emnist-web-app

TensorFlow.js: https://www.tensorflow.org/js

Font Awesome: https://fontawesome.com

## License

This project is for educational purposes for CSE 518: Foundations of Human Computer Interaction and is licensed under the MIT License.
