import React from 'react';
import {
  ContactWrapper,
  ContactForm,
  SubmitButton,
  ContactCard,
  ContactTitle,
  // ContactTitleWrapper,
  LeftHalfInputs,
  RightHalfInputs,
  RightTextArea,
  LeftInput
} from '../styles/booking-styles';

const Booking = () => (
  <ContactWrapper id='booking'>
    <ContactTitle>BOOKING</ContactTitle>
    <ContactCard>
      <ContactForm
        netlify='true'
        data-netlify='true'
        method='POST'
        data-netlify-honeypot='bot-field'
        name='contact-form-1'
        action='./thanks'
      >
        <LeftHalfInputs>
          <LeftInput name='name' type='text' placeholder='Name' />
          <LeftInput name='email' type='email' placeholder='Email address' />
          <LeftInput name='subject' type='text' placeholder='Subject' />
          <input type='hidden' name='form-name' value='contact-form-1' />
          <input
            type='hidden'
            name='_next'
            value='./thanks'
            style={{ display: 'none' }}
          />
        </LeftHalfInputs>
        <RightHalfInputs>
          <RightTextArea name='message' type='text' placeholder='Message' />
        </RightHalfInputs>
        <div data-netlify-recaptcha='true' />
        <SubmitButton type='submit' value='submit'>
          SUBMIT
        </SubmitButton>
      </ContactForm>
    </ContactCard>
  </ContactWrapper>
);

export default Booking;
