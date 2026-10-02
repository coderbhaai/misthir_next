import ContactForm from '@amitkk/basic/admin/contact/ContactForm';
import type { PageDetailProps } from '@amitkk/basic/types/page';
import { UI_STRINGS } from '@amitkk/basic/utils/config';

export interface Props {
  details?: PageDetailProps;
}

export default function ContactPanel({ details }: Props) {
    if (!details || !details?.contact_title) return null;

    const heading = details?.contact_title?.trim() || UI_STRINGS.contact_title;
    const text = details?.contact_text?.trim() || UI_STRINGS.contact_text;

    return (
        <section className="relative w-full bg-fixed bg-center bg-cover flex flex-col items-center justify-center text-center " style={{ backgroundImage: "url('/images/static/parallax/home-parallax.jpg')" }}>
            <div className="container py-5 md:py-12 ">
                <div className="row mt-3 items-center">
                    <div className="col-span-12 md:col-span-6 white_me">
                        <h2 className="heading">{heading}</h2>
                        {details?.contact_text && ( <div dangerouslySetInnerHTML={{ __html: text }}/> )}
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="white_me md:pl-5">
                            <ContactForm handleClose={() => {}} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}