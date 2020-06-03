import React from 'react';
import {
  BookingWrapper,
  BookingForm,
  SubmitButton,
  BookingCard,
  BookingTitle,
  LeftHalfInputs,
  RightHalfInputs,
  RightTextArea,
  LeftInput
} from '../styles/booking-styles';

const Booking = () => (
  <BookingWrapper id='booking'>
    <BookingTitle>BOOKING</BookingTitle>
    <BookingCard>
      <BookingForm
        data-netlify='true'
        method='POST'
        data-netlify-honeypot='bot-field'
        name='contact-form-1'
        action="/pages/thanks"
      >
        <LeftHalfInputs>
          <LeftInput name='name' type='text' placeholder='Name' />
          <LeftInput name='email' type='email' placeholder='Email address' />
          <LeftInput name='subject' type='text' placeholder='Subject' />
          <input type='hidden' name='bot-field' />
        </LeftHalfInputs>
        <RightHalfInputs>
          <RightTextArea name='message' type='text' placeholder='Message' />
        </RightHalfInputs>
        <SubmitButton type='submit' value='submit'>
          SUBMIT
        </SubmitButton>
      </BookingForm>
    </BookingCard>
  </BookingWrapper>
);

export default Booking;
