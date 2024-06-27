import React from "react";
import { Form } from "react-bootstrap";
import { QuestionType } from "./types";

interface QuestionProps {
  question: QuestionType;
  onOptionChange: (questionId: number, answer: boolean) => void;
}

const Question: React.FC<QuestionProps> = ({ question, onOptionChange }) => {
  const { id, text, option0, option1 } = question;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    onOptionChange(id, value === "option1");
  };

  return (
    <div>
      <h5>{text}</h5>
      <Form>
        <Form.Check
          type="radio"
          id={`option0_${id}`}
          name={`question_${id}`}
          value="option0"
          label={option0}
          onChange={handleChange}
        />
        <Form.Check
          type="radio"
          id={`option1_${id}`}
          name={`question_${id}`}
          value="option1"
          label={option1}
          onChange={handleChange}
        />
      </Form>
    </div>
  );
};

export default Question;
