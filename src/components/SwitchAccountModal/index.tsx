import { useState } from 'react';
import styles from './styles.module.css';

interface SwitchAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBaseUrl: string;
    onSave: (newUrl: string) => void;
}

export const SwitchAccountModal = ({ isOpen, onClose, currentBaseUrl, onSave }: SwitchAccountModalProps) => {
    const [newUrl, setNewUrl] = useState(currentBaseUrl);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(newUrl);
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Switch Account</h2>
                <div className={styles.content}>
                    <label className={styles.label}>
                        Base API URL:
                        <input
                            type="text"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className={styles.input}
                        />
                    </label>
                </div>
                <div className={styles.actions}>
                    <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
                    <button onClick={handleSave} className={styles.saveButton}>Save</button>
                </div>
            </div>
        </div>
    );
};

