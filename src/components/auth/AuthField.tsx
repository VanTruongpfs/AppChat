import type{ComponentPropsWithoutRef} from "react";
type AuthFieldProps = ComponentPropsWithoutRef<"input"> & {
    id: string;
    label: string;
};
export default function AuthField({ id, label, ...inputProps }: AuthFieldProps) {
    return (
        <>
            <div className="auth-field">
                <label htmlFor={id}>{label}</label>
                <input {...inputProps} id={id}/>
            </div>
        </>
    )
}