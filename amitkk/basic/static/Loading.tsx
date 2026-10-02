export default function Loading() {

  return (
    <div
      className="
        flex
        items-center
        justify-center
        py-10
      "
    >

      <div
        className="
          h-8
          w-8
          animate-spin
          rounded-full
          border-2
          border-primary/20
          border-t-primary
        "
      />

    </div>
  );
}