import selfies as sf
import pandas as pd
import numpy as np


def get_selfie_and_smiles_encodings_for_dataset(file_path):
    """
    From Selfies example
    Returns encoding, alphabet and length of largest molecule in SMILES and
    SELFIES, given a file containing SMILES molecules.
    input:
        csv file with molecules. Column's name must be 'smiles'.
    output:
        - selfies encoding
        - selfies alphabet
        - longest selfies string
        - smiles encoding (equivalent to file content)
        - smiles alphabet (character based)
        - longest smiles string
    """

    df = pd.read_csv(file_path)
    print(df.head())
    smiles_list = np.asanyarray(df.iloc[:, 0])

    smiles_alphabet = list(set(''.join(smiles_list)))
    smiles_alphabet.append(' ')  # for padding

    largest_smiles_len = len(max(smiles_list, key=len))

    print('--> Translating SMILES to SELFIES...')
    selfies_list = list(map(sf.encoder, smiles_list[:1000]))

    all_selfies_symbols = sf.get_alphabet_from_selfies(selfies_list)
    all_selfies_symbols.add('[nop]')
    selfies_alphabet = list(all_selfies_symbols)

    largest_selfies_len = max(sf.len_selfies(s) for s in selfies_list)

    print('Finished translating SMILES to SELFIES.')

    return selfies_list, selfies_alphabet, largest_selfies_len, \
        smiles_list, smiles_alphabet, largest_smiles_len


data_url = 'https://github.com/aspuru-guzik-group/selfies/raw/16a489afa70882428bc194b2b24a2d33573f1651/examples/vae_example/datasets/dataJ_250k_rndm_zinc_drugs_clean.txt'
_, alphabet, *_ = get_selfie_and_smiles_encodings_for_dataset(data_url)
print(len(alphabet))

example = np.random.choice(alphabet, size=10)
print(''.join(example))
smiles = sf.decoder(''.join(example))

print('smiles', smiles)
