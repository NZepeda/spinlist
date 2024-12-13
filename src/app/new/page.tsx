import NewRatingForm from "./NewRatingForm";

/**
 * Lets the user create a new rating.
 * The user can select an album from the search results.
 * The user can select a rating from 1 to 5.
 * The user can leave a review.
 * The user can submit the rating.
 * The user can select their favorite track. (Optional)
 * The user can select their least favorite track. (Optional)
 */
export default function NewRatingPage() {
  return (
    <div className="flex flex-col w-full lg:w-2/3 container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create a New Rating</h1>
      <NewRatingForm />
    </div>
  );
}
