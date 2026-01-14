interface PaymentLogosProps {
  dark?: boolean;
}

const PaymentLogos = ({ dark = false }: PaymentLogosProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <img 
        src="/payment-icons.png" 
        alt="Payment methods: VISA, Mastercard, LibraPay, Stripe, Plăți Instant"
        className="h-8 object-contain"
      />
    </div>
  );
};

export default PaymentLogos;

