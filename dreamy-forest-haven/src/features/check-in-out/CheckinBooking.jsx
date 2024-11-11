import styled from "styled-components";
import BookingDataBox from "../../features/bookings/BookingDataBox";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";
import useBookingDetail from "../bookings/useBookingDetail";
import Spinner from "../../ui/Spinner";
import CheckBox from "../../ui/CheckBox";
import useCheckin from "./useCheckin";
import { useSettings } from "../settings/useSettings";
import { useMoveBack } from "../../hooks/useMoveBack";
import { useEffect, useState } from "react";
import { formatCurrency } from "../../utils/helpers";

const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem 4rem;
`;

function CheckinBooking() {
  const { bookingDetail = {}, isPending } = useBookingDetail();
  const { checkin, isCheckin } = useCheckin();
  const { isLoading, settings = {} } = useSettings();
  const [confirmPaid, setConfirmPaid] = useState();
  const [haveBreakfast, setHaveBreakfast] = useState();
  const moveBack = useMoveBack();

  useEffect(
    () => setConfirmPaid(bookingDetail?.isPaid ?? false),
    [bookingDetail]
  );

  const {
    id: bookingId,
    guests,
    totalPrice,
    numGuests,
    hasBreakfast,
    numNights,
  } = bookingDetail;

  function handleCheckin() {
    if (haveBreakfast) {
      checkin({
        bookingId,
        breakfast: {
          hasBreakfast: true,
          extrasPrice: optionalBreakfastPrice,
          totalPrice: totalPrice + optionalBreakfastPrice,
        },
      });
    } else {
      checkin({ bookingId, breakfast: {} });
    }
  }

  const optionalBreakfastPrice =
    settings.breakfastPrice * numNights * numGuests;

  if (isPending || isLoading) return <Spinner />;

  return (
    <>
      <Row type='horizontal'>
        <Heading as='h1'>Check in booking #{bookingId}</Heading>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={bookingDetail} />

      {!hasBreakfast && (
        <Box>
          <CheckBox
            checked={haveBreakfast}
            onChange={() => {
              setHaveBreakfast((add) => !add);
              setConfirmPaid(false);
            }}
            id='breakfast'
          >
            Guest have used breakfast. Additional price:{" "}
            {formatCurrency(optionalBreakfastPrice)}
          </CheckBox>
        </Box>
      )}

      <Box>
        <CheckBox
          checked={confirmPaid}
          disabled={confirmPaid}
          onChange={() => setConfirmPaid((state) => !state)}
          id='confirm'
        >
          {guests.fullName} has paid{" "}
          {!haveBreakfast
            ? formatCurrency(totalPrice)
            : `${formatCurrency(
                totalPrice + optionalBreakfastPrice
              )} (+${formatCurrency(optionalBreakfastPrice)})`}
          !
        </CheckBox>
      </Box>

      <ButtonGroup>
        <Button onClick={handleCheckin} disabled={!confirmPaid || isCheckin}>
          Check in booking #{bookingId}
        </Button>
        <Button variation='secondary' onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
}

export default CheckinBooking;